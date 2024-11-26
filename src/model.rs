use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;

#[derive(Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "transactions")]
pub struct Transaction {
    pub id: String,
    pub datetime: String,
    pub trx_type: String,
    pub trx_subtype: String,
    pub wallet_from: Option<String>,
    pub wallet_to: Option<String>,
    pub name: String,
    pub amount: i64,
    pub fee: Option<i64>,
    pub description: Option<String>,
}
