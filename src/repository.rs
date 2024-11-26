use deadpool_postgres::Client;
use tokio_pg_mapper::FromTokioPostgresRow;

use crate::{error::MyError, model::Transaction};

pub async fn get_transactions(client: &Client) -> Result<Vec<Transaction>, MyError> {
    let stmt = r#"
        SELECT
            id,
            datetime,
            trx_type,
            trx_subtype,
            wallet_from,
            wallet_to,
            name,
            amount,
            fee,
            description
        FROM transactions
    "#;
    let stmt = client.prepare(&stmt).await.unwrap();

    let results = client
        .query(&stmt, &[])
        .await?
        .iter()
        .map(|row| Transaction::from_row_ref(row).unwrap())
        .collect::<Vec<Transaction>>();

    Ok(results)
}

pub async fn add_transaction(
    client: &Client,
    transaction: Transaction,
) -> Result<Transaction, MyError> {
    let _stmt = r#"
        INSERT INTO transactions(
            id,
            datetime,
            trx_type,
            trx_subtype,
            wallet_from,
            wallet_to,
            name,
            amount,
            fee,
            description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
            id,
            datetime,
            trx_type,
            trx_subtype,
            wallet_from,
            wallet_to,
            name,
            amount,
            fee,
            description
    "#;
    let stmt = client.prepare(&_stmt).await.unwrap();

    client
        .query(
            &stmt,
            &[
                &transaction.id,
                &transaction.datetime,
                &transaction.trx_type,
                &transaction.trx_subtype,
                &transaction.wallet_from,
                &transaction.wallet_to,
                &transaction.name,
                &transaction.amount,
                &transaction.fee,
                &transaction.description,
            ],
        )
        .await?
        .iter()
        .map(|row| Transaction::from_row_ref(row).unwrap())
        .collect::<Vec<Transaction>>()
        .pop()
        .ok_or(MyError::NotFound)
}
