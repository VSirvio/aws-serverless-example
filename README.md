# aws-serverless-example

A simple example project I wrote to practice using AWS serverless functions ([AWS Lambda](https://aws.amazon.com/lambda)), [DynamoDB](https://aws.amazon.com/dynamodb) and [Terraform](https://www.terraform.io). All of the project's source code is currently inconveniently in just one file `src/index.mts`. It could be improved by separating database-related code and Lambda-related code to separate files.

## Project structure

| File | Description |
| ---- | -----|
| [src/index.mts](https://github.com/VSirvio/aws-serverless-example/blob/main/src/index.mts) | project source code |
| [db-sample-data.json](https://github.com/VSirvio/aws-serverless-example/blob/main/db-sample-data.json) | sample data for DB |
| [main.tf](https://github.com/VSirvio/aws-serverless-example/blob/main/main.tf) | Terraform configuration |
| [package.json](https://github.com/VSirvio/aws-serverless-example/blob/main/package.json) | Node.js project configuration |
| [tsconfig.json](https://github.com/VSirvio/aws-serverless-example/blob/main/tsconfig.json "tsconfig.json") | TypeScript compiler configuration |

## Deploying to AWS

1. Make sure you have Terraform installed ([instructions here](https://developer.hashicorp.com/terraform/install))
2. Configure AWS provider for Terraform ([instructions here](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration))
3. Initialize Terraform by executing in the project root directory:

       terraform init

4. Setup the infrastructure and deploy to AWS by executing in the project root directory:

       terraform apply
