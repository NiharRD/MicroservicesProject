Enter the Container:

docker exec -it <container_name_or_id> bash

Enter Postgres DB (from inside the container):

psql -U <your_username>

Enter the Default Database:

psql -U admin -d postgres. Here admin in the database name

Access a Microservice-Specific Database:

psql -U admin -d user_service_db
