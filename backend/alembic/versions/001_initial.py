"""initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # SQLModel handles table creation via create_all on startup
    pass


def downgrade():
    pass
