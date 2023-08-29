# Vote System
## Data set
Certainly! Below is a Markdown representation of your vote system dataset in Redis:

### Sets
- **Key:** `item_voted_by:{voteid}`
  - **Value:** `{userid}`
  - **Type:** String
  - **Description:** Stores a set of user IDs who voted for a specific vote item (`voteid`).

### Strings
- **Key:** `users:{userid}`
  - **Value:** `'{firstname, lastname, password}'`
  - **Type:** String
  - **Description:** Stores user information including first name, last name, and password for a given user ID (`userid`).

### Sorted Sets (ZSets)
- **Key:** `vote_counts`
  - **Value:** `{voteid}`
  - **Type:** Sorted Set (ZSet)
  - **Description:** Keeps track of the vote counts for each vote item (`voteid`) in descending order.

### Hashes
- **Key:** `vote_item`
  - **Value:** `{voteid: description}`
  - **Type:** Hash
  - **Description:** Stores descriptions of vote items (`voteid`) associated with their respective vote IDs.

- **Key:** `voted_user`
  - **Value:** `{userid: voteid}`
  - **Type:** Hash
  - **Description:** Records the votes cast by users (`userid`) for specific vote items (`voteid`).


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test
```bash
# unit tests
$ npm run test
```

## Serve
### Build as docker (docker-compose)
```bash
# deploy to docker (docker-compose)
$ docker-compose -p "api" up -d
```
### To view generated users (from faker-js)
```bash
# Example data aida,Zj4CjyhgzF1WIRxvht0Gx <user,password>
$ docker exec -it api-nestjs-1 sh -c 'cat user.txt'
```
### Postman
https://documenter.getpostman.com/view/3615872/2s9Y5Zw2wd