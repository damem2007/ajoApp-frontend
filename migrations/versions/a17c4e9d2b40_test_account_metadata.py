"""Explicit test-account metadata."""
from alembic import op
import sqlalchemy as sa

revision = 'a17c4e9d2b40'
down_revision = '9f2b6a7c4d11'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('accounts', sa.Column('source', sa.String(), nullable=False, server_default='app'))
    op.add_column('accounts', sa.Column('test_run_id', sa.String(), nullable=True))
    op.create_index('ix_accounts_test_run_id', 'accounts', ['test_run_id'])
    op.alter_column('accounts', 'source', server_default=None)


def downgrade():
    op.drop_index('ix_accounts_test_run_id', table_name='accounts')
    op.drop_column('accounts', 'test_run_id')
    op.drop_column('accounts', 'source')
