"""Transactional outbox."""
from alembic import op
import sqlalchemy as sa

revision = '9f2b6a7c4d11'
down_revision = '7bb13c20a6f9'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'outbox_events',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('aggregate_type', sa.String(), nullable=False),
        sa.Column('aggregate_id', sa.String(), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('idempotency_key', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('attempt_count', sa.Integer(), nullable=False),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.Column('published_at', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('idempotency_key'),
    )
    op.create_index('ix_outbox_events_event_type', 'outbox_events', ['event_type'])
    op.create_index('ix_outbox_events_aggregate_id', 'outbox_events', ['aggregate_id'])
    op.create_index('ix_outbox_events_status', 'outbox_events', ['status'])


def downgrade():
    op.drop_index('ix_outbox_events_status', table_name='outbox_events')
    op.drop_index('ix_outbox_events_aggregate_id', table_name='outbox_events')
    op.drop_index('ix_outbox_events_event_type', table_name='outbox_events')
    op.drop_table('outbox_events')
