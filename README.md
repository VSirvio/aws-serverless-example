# aws-serverless-example

A simple example project I wrote to practice using AWS serverless functions ([AWS Lambda](https://aws.amazon.com/lambda)), [DynamoDB](https://aws.amazon.com/dynamodb) and [Terraform](https://www.terraform.io). It is a REST API for creating, viewing and managing restaurant reviews.

## Project structure

| File | Description |
| ---- | -----|
| [src/index.mts](https://github.com/VSirvio/aws-serverless-example/blob/main/src/index.mts) | Lambda handler function |
| [src/database/review.mts](https://github.com/VSirvio/aws-serverless-example/blob/main/src/database/review.mts) | functions for interacting with the database |
| [src/http-request-handlers/review.mts](https://github.com/VSirvio/aws-serverless-example/blob/main/src/http-request-handlers/review.mts) | HTTP request handler functions |
| [db-sample-data.json](https://github.com/VSirvio/aws-serverless-example/blob/main/db-sample-data.json) | sample data for DB |
| [main.tf](https://github.com/VSirvio/aws-serverless-example/blob/main/main.tf) | Terraform configuration |

## How to build

1. Make sure you have Node.js installed ([instructions here](https://nodejs.org/en/download))
2. Install dependencies by executing in the project root directory:

       npm ci

3. Compile TypeScript code by executing in the project root directory:

       npm run build

## Deploying to AWS

1. Make sure you have followed the instructions in the `How to build` section
2. Make sure you have Terraform installed ([instructions here](https://developer.hashicorp.com/terraform/install))
3. Configure AWS provider for Terraform ([instructions here](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration))
4. Initialize Terraform by executing in the project root directory:

       terraform init

5. Setup the infrastructure and deploy to AWS by executing in the project root directory:

       terraform apply

## API reference

| Endpoint                                                                                                      | Description                      |
|---------------------------------------------------------------------------------------------------------------|----------------------------------|
| [GET /reviews](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#get-reviews)              | List all restaurant reviews      |
| [GET /reviews/{id}](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#get-reviewsid)       | Get a restaurant review by id    |
| [POST /reviews](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#post-reviews)            | Add a new restaurant review      |
| [DELETE /reviews/{id}](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#delete-reviewsid) | Delete a restaurant review by id |
| [PATCH /reviews/{id}](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#patch-reviewsid)   | Edit a restaurant review by id   |

### GET /reviews

List all restaurant reviews

#### Sample request

```bash
curl -X GET "https://$API_URL/reviews"
```

#### Sample response

```json
{
  "data": [
    {
      "id": "A8BVM",
      "date": "2025-06-07",
      "restaurant": "Big Bob's Barbecue",
      "stars": 3
    },
    {
      "id": "Z3Y9W",
      "date": "2025-06-18",
      "restaurant": "Luigi's Trattoria",
      "stars": 2
    }
  ]
}
```

### GET /reviews/{id}

Get a restaurant review by id

#### Sample request

```bash
curl -X GET "https://$API_URL/reviews/A8BVM"
```

#### Sample response

```json
{
  "data": {
    "id": "A8BVM",
    "date": "2025-06-07",
    "restaurant": "Big Bob's Barbecue",
    "stars": 3
  }
}
```

### POST /reviews

Add a new restaurant review

#### Sample request

```bash
curl -X POST "https://$API_URL/reviews" \
     -H 'Content-Type: application/json' \
     -d '{"date": "2025-04-16", "restaurant": "Texas Steak House", "stars": 4}'
```

#### Sample response

```json
{
  "data": {
    "id": "2NAW2",
    "date": "2025-04-16",
    "restaurant": "Texas Steak House",
    "stars": 4
  }
}
```

### DELETE /reviews/{id}

Delete a restaurant review by id

#### Sample request

```bash
curl -X DELETE "https://$API_URL/reviews/2NAW2"
```

#### Sample response

```
–
```

### PATCH /reviews/{id}

Edit a restaurant review by id

#### Sample request

```bash
curl -X PATCH "https://$API_URL/reviews/2NAW2" \
     -H 'Content-Type: application/json' \
     -d '{"restaurant": "Texas Coffee House", "stars": 3}'
```

#### Sample response

```json
{
  "data": {
    "id": "2NAW2",
    "date": "2025-04-16",
    "restaurant": "Texas Coffee House",
    "stars": 3
  }
}
```
