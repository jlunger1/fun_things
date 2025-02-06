import os
import requests
import openai
import re
from dotenv import load_dotenv
from tqdm import tqdm
from django.db.utils import IntegrityError
from django.contrib.gis.geos import Point
import time

# Load environment variables
load_dotenv()
NPS_API_KEY = os.getenv("NPS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

import django
django.setup()

from fun_things.core.models import NPSThingToDo

class NPSScraper:
    """Scraper to fetch and store 'things to do' from the NPS API."""

    BASE_URL = "https://developer.nps.gov/api/v1"

    def __init__(self):
        self.headers = {"X-Api-Key": NPS_API_KEY}
        openai.api_key = OPENAI_API_KEY

    def get_things_to_do(self, limit=50, start=0):
        """Fetch 'things to do' from the NPS API with pagination support."""
        url = f"{self.BASE_URL}/thingstodo"
        params = {
            "limit": limit,
            "start": start
        }
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            # Ensure total is converted to int
            total = int(data.get("total", 0))
            return data.get("data", []), total
        else:
            print(f"Error fetching things to do: {response.status_code} - {response.text}")
            return [], 0

    def clean_description(self, text):
        """Cleans up unwanted characters from descriptions."""
        if not text:
            return "No description available."
        text = re.sub(r"</?p>", "", text)  # Remove <p> and </p> tags
        text = text.replace("---", "").strip()  # Remove "---"
        text = re.sub(r"\s+", " ", text)  # Normalize excessive spaces
        return text

    def rewrite_description(self, original_text):
        """Use GPT-4 to improve the description formatting."""
        if not original_text:
            return "No description available."

        prompt = f"""
        Here is a description of an activity:
        ---
        {original_text}
        ---
        Summarize this text in a concise and engaging way.

        The summary should be clean so that it will look nice on a website.
        It should not include any characters that look like html code, make sure it's easy to read, 
        do not include symbols like "---" or "#", and ensure it's concise and engaging.
        Do not include phone numbers or email addresses. Format it so it would look nice in a textbook.
        
        Keep the text to under 200 words.
        """

        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert copywriter."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error rewriting description: {e}")
            return original_text  # Fallback to original
        

    def store_things_to_do(self, batch_size=50):
        """Fetch and store all 'things to do' with pagination support."""
        start = 0
        total_items = None
        
        while total_items is None or start < int(total_items):
            print(f'Fetching things to do (start: {start})...')
            things_to_do, total_items = self.get_things_to_do(limit=batch_size, start=start)
            
            if not things_to_do:
                break
                
            print(f'Found {len(things_to_do)} things to do (Total: {total_items})')

            for thing in tqdm(things_to_do, total=len(things_to_do)):
                thing_id = thing.get("id")

                if not thing_id:
                    print(f"Skipping due to missing ID for {thing.get('title')}")
                    continue

                if NPSThingToDo.objects.filter(nps_id=str(thing_id)).exists():
                    print(f"Skipping existing thing to do: {thing.get('title')}")
                    continue

                original_description = thing.get("longDescription", "")
                better_description = self.rewrite_description(original_description)
                better_description = self.clean_description(better_description)

                # Convert latitude and longitude to a PointField
                latitude = thing.get("latitude")
                longitude = thing.get("longitude")
                location = None

                if latitude and longitude:
                    try:
                        latitude = float(latitude)
                        longitude = float(longitude)
                        location = Point(longitude, latitude)  # Longitude first in GEOS Point
                    except ValueError:
                        print(f"Invalid lat/lon for {thing.get('title')}")

                try:
                    obj = NPSThingToDo.objects.create(
                        nps_id=str(thing_id),
                        title=thing.get("title", "Unknown"),
                        description=better_description,
                        url=thing.get("url", ""),
                        image_url=thing.get("images", [{}])[0].get("url", ""),
                        location=location,  # Store as PointField
                    )
                    print(f"Added new thing to do: {thing.get('title')}")
                except IntegrityError as e:
                    print(f"Skipped duplicate thing to do: {thing.get('title')} (Error: {e})")
                
            start += batch_size
            
            # Optional: Add a small delay to be nice to the API
            time.sleep(1)

if __name__ == "__main__":
    scraper = NPSScraper()
    scraper.store_things_to_do()