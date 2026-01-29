"""AWS session/client utilities."""

from __future__ import annotations

import os
from typing import Optional
from contextlib import contextmanager

import boto3
from botocore.config import Config


@contextmanager
def _masked_env_vars(vars_to_mask):
    """Temporarily unset environment variables."""
    stash = {}
    for k in vars_to_mask:
        if k in os.environ:
            stash[k] = os.environ.pop(k)
    try:
        yield
    finally:
        for k, v in stash.items():
            os.environ[k] = v


def get_boto3_session(
    profile_name: Optional[str] = None, region_name: Optional[str] = None
) -> boto3.session.Session:
    """Create boto3 session with optional profile/region overrides."""
    import logging

    logger = logging.getLogger(__name__)

    # Default to None if not provided (caller can choose specific profile)
    # Note: AWS_PROFILE env var is respected by boto3 automatically if not overridden,
    # but we handle it explicit here for logging/control.
    profile = profile_name or os.getenv("AWS_PROFILE")
    region = region_name or os.getenv("AWS_REGION")

    logger.info(f"Creating boto3 session: profile={profile}, region={region}")
    try:
        # If a specific profile is requested, masked env vars ensure we don't accidentally
        # use conflicting global credentials (like AWS_ACCESS_KEY_ID from .env)
        if profile:
            with _masked_env_vars(
                ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN"]
            ):
                return boto3.Session(profile_name=profile, region_name=region)
        else:
            return boto3.Session(profile_name=profile, region_name=region)
    except Exception as e:
        # If specific profile not found (e.g. in CI/CD without 'Nam' profile),
        # fallback to default credential chain (Env vars, Instance profile, etc)
        logger.warning(
            f"Failed to create session with profile '{profile}': {e}. Falling back to default credentials."
        )
        return boto3.Session(profile_name=None, region_name=region)


def get_dynamo_table(table_name: str, profile_name: Optional[str] = None, region_name: Optional[str] = None):
    """Return DynamoDB Table resource."""
    session = get_boto3_session(profile_name, region_name)
    dynamodb = session.resource("dynamodb", config=Config(retries={"max_attempts": 3}))
    return dynamodb.Table(table_name)


def get_s3_client(profile_name: Optional[str] = None, region_name: Optional[str] = None):
    """Return S3 client."""
    session = get_boto3_session(profile_name, region_name)
    return session.client("s3", config=Config(retries={"max_attempts": 3}))
