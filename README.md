# aws-serverless-example

A simple example project I wrote to practice using AWS serverless functions ([AWS Lambda](https://aws.amazon.com/lambda)), [DynamoDB](https://aws.amazon.com/dynamodb) and [Terraform](https://www.terraform.io). It is a REST API for creating, viewing and managing restaurant reviews. All of the project's source code is currently inconveniently in just one file `src/index.mts`. It could be improved by separating database-related code and Lambda-related code to separate files.

## Project structure

| File | Description |
| ---- | -----|
| [src/index.mts](https://github.com/VSirvio/aws-serverless-example/blob/main/src/index.mts) | project source code |
| [db-sample-data.json](https://github.com/VSirvio/aws-serverless-example/blob/main/db-sample-data.json) | sample data for DB |
| [main.tf](https://github.com/VSirvio/aws-serverless-example/blob/main/main.tf) | Terraform configuration |
| [package.json](https://github.com/VSirvio/aws-serverless-example/blob/main/package.json) | Node.js project configuration |
| [tsconfig.json](https://github.com/VSirvio/aws-serverless-example/blob/main/tsconfig.json "tsconfig.json") | TypeScript compiler configuration |

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

| Endpoint                                                                                       | Description                      |
|------------------------------------------------------------------------------------------------|----------------------------------|
| [GET /](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#get-)             | List all restaurant reviews      |
| [GET /{id}](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#get-id)       | Get a restaurant review by id    |
| [POST /](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#post-)           | Add a new restaurant review      |
| [DELETE /{id}](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#delete-id) | Delete a restaurant review by id |
| [PATCH /{id}](https://github.com/VSirvio/aws-serverless-example?tab=readme-ov-file#patch-id)   | Edit a restaurant review by id   |

### GET /

List all restaurant reviews

#### Sample request

```bash
curl -X GET "https://$API_URL/"
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

### GET /{id}

Get a restaurant review by id

#### Sample request

```bash
curl -X GET "https://$API_URL/A8BVM"
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

### POST /

Add a new restaurant review

#### Sample request

```bash
curl -X POST "https://$API_URL/" \
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

### DELETE /{id}

Delete a restaurant review by id

#### Sample request

```bash
curl -X DELETE "https://$API_URL/2NAW2"
```

#### Sample response

```
–
```

### PATCH /{id}

Edit a restaurant review by id

#### Sample request

```bash
curl -X PATCH "https://$API_URL/2NAW2" \
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
