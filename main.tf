provider "aws" {}

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

data "archive_file" "lambda_deployment_package" {
  type        = "zip"
  source_file = "${path.module}/src/index.mjs"
  output_path = "${path.module}/release/lambda_function.zip"
}

resource "aws_lambda_function" "main_function" {
  filename         = data.archive_file.lambda_deployment_package.output_path
  function_name    = "serverless-example-project-lambda-function"
  role             = aws_iam_role.execution_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_deployment_package.output_base64sha256
  runtime          = "nodejs22.x"
}

resource "aws_lambda_function_url" "main_function_url" {
  function_name      = aws_lambda_function.main_function.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
  }
}
