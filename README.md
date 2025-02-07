# fun_things

Welcome to FunThingToDoNearMe! fun_things is a web app which aids users in the discovery of fun things near them. The UI is very simple -- an activity is shown to the user who has the option to save, thumbs up, or thumbs down. 

## Setting up the environment

To set up the uv environment, do the following:
```
uv venv
source .venv/bin/activate
uv sync
```

This should be all you need to start running fun_things!

## Running the backend

The backend needs to be running for the front end to be able to hit the API endpoints. fun_things is a django app... to start the backend run the following:
```
python manage.py runserver
```

## Running the frontend

The UI for fun_things is a next.js project. To run the front-end type the following inside the fun_things/frontend/app directory:
```
npm run dev
```

## Future work

This is a very rudimentary demo. The UI currently serves users random activities from the national park service, and the heart and thumbs up/down buttons don't do anything yet!

Coming soon:
- user interactions on the frontend get saved to the database
- more activities added to the database
- activities served will be location specific -- served with a distribution based on distance from the user
- login with a page for saves 
- users to have the ability to add their own custom fun things
- fun things served with a recommender algorithm based on LLM embeddings of the activity description (requires user data first!)
