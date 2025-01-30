import os
import requests
import openai
from dotenv import load_dotenv
from tqdm import tqdm
from django.db.utils import IntegrityError

# Load environment variables
load_dotenv()
NPS_API_KEY = os.getenv("NPS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

import django
django.setup()
from fun_things.core.models import NPSThingToDo

import re

class NPSScraper:
    """Scraper to fetch and store 'things to do' from the NPS API."""

    BASE_URL = "https://developer.nps.gov/api/v1"

    def __init__(self):
        self.headers = {"X-Api-Key": NPS_API_KEY}
        openai.api_key = OPENAI_API_KEY

    def get_things_to_do(self, limit=100):
        """Fetch 'things to do' from the NPS API."""
        url = f"{self.BASE_URL}/thingstodo"
        params = {"limit": limit}
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json().get("data", [])
        else:
            print(f"Error fetching things to do: {response.status_code} - {response.text}")
            return []

    def rewrite_description(self, original_text):
        """Use GPT-4 to improve the description formatting."""
        if not original_text:
            return "No description available."

        prompt = f"""
        Here is a poorly formatted description of an activity:
        ---
        {original_text}
        ---
        Rewrite it to be concise, engaging, and well-formatted for a website about fun things to do.
        """

        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "system", "content": "You are an expert copywriter."},
                          {"role": "user", "content": prompt}],
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error rewriting description: {e}")
            return original_text  # Fallback to original
        
    import re

    def clean_description(text):
        """Cleans up unwanted characters from descriptions."""
        if not text:
            return "No description available."

        text = re.sub(r"</?p>", "", text)  # Remove <p> and </p> tags
        text = text.replace("---", "").strip()  # Remove "---"
        text = re.sub(r"\s+", " ", text)  # Normalize excessive spaces
        return text


    def store_things_to_do(self):
        """Fetch and store 'things to do' with better location parsing."""
        print('Fetching things to do...')
        things_to_do = self.get_things_to_do()

        for thing in things_to_do:
            thing_id = thing.get("id")
            if not thing_id:
                continue

            # Extracting better location data
            latitude = thing.get("latitude")
            longitude = thing.get("longitude")
            park_name = thing.get("relatedParks", [{}])
            if park_name:
                park_name = park_name[0].get("title")
            location_desc = thing.get("locationDescription", "").split("<br")[0]  # Clean HTML tags

            if not latitude or not longitude:
                print(f"⚠️ Missing coordinates for {thing.get('title')}, using park name.")

            try:
                NPSThingToDo.objects.update_or_create(
                    nps_id=str(thing_id),
                    defaults={
                        "title": thing.get("title"),
                        "description": thing.get("shortDescription", ""),
                        "url": thing.get("url", ""),
                        "image_url": thing.get("images", [{}])[0].get("url", ""),
                        "location": park_name or location_desc,  # Use best available location
                        "latitude": latitude if latitude else None,
                        "longitude": longitude if longitude else None,
                        "raw_data": thing,
                    }
                )
            except IntegrityError as e:
                print(f"Skipping duplicate: {thing.get('title')} (Error: {e})")


if __name__ == "__main__":
    scraper = NPSScraper()
    scraper.store_things_to_do()
