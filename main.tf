provider "aws" {}

locals {
  reviews_table_name = "restaurant-reviews"
}

data "aws_caller_identity" "current" {}

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

resource "aws_iam_role_policy" "lambda_logging_policy" {
  name = "serverless-example-project-lambda-logging-policy"
  role = aws_iam_role.execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Action    = "logs:CreateLogGroup"
        Resource  = "arn:aws:logs:${aws_lambda_function.main_function.region}:${data.aws_caller_identity.current.account_id}:*"
        Condition = {
          ArnEquals = {
            "lambda:SourceFunctionArn" = aws_lambda_function.main_function.arn
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource  = "arn:aws:logs:${aws_lambda_function.main_function.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${aws_lambda_function.main_function.function_name}:*"
        Condition = {
          ArnEquals = {
            "lambda:SourceFunctionArn" = aws_lambda_function.main_function.arn
          }
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "dynamodb_access_policy" {
  name = "serverless-example-project-dynamodb-access-policy"
  role = aws_iam_role.execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
        ]
        Resource  = aws_dynamodb_table.restaurant_reviews_table.arn
        Condition = {
          ArnEquals = {
            "lambda:SourceFunctionArn" = aws_lambda_function.main_function.arn
          }
        }
      },
    ]
  })
}

data "archive_file" "lambda_deployment_package" {
  type        = "zip"
  source_dir  = "${path.module}/build/ts-out"
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
