provider "aws" {}

locals {
  reviews_table_name = "restaurant-reviews"
}

resource "aws_dynamodb_table" "restaurant_reviews_table" {
  name           = local.reviews_table_name
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution_role" {
  name               = "serverless-example-project-execution-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_role_policy" {
  role       = aws_iam_role.execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "dynamodb_full_access_policy" {
  role       = aws_iam_role.execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

data "archive_file" "lambda_deployment_package" {
  type        = "zip"
  source_file = "${path.module}/build/ts-out/index.mjs"
  output_path = "${path.module}/build/lambda_function.zip"
}

resource "aws_lambda_function" "main_function" {
  filename         = data.archive_file.lambda_deployment_package.output_path
  function_name    = "serverless-example-project-lambda-function"
  role             = aws_iam_role.execution_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_deployment_package.output_base64sha256
  runtime          = "nodejs24.x"

  environment {
    variables = {
      REVIEWS_TABLE_NAME = local.reviews_table_name
    }
  }
}

resource "aws_lambda_function_url" "main_function_url" {
  function_name      = aws_lambda_function.main_function.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
  }
}
