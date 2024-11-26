use actix_web::{web, App, Error, HttpResponse, HttpServer};
use confik::{Configuration as _, EnvSource};
use deadpool_postgres::{Client, Pool};
use dotenvy::dotenv;
use tokio_postgres::NoTls;

use crate::config::Config;

mod config;
mod error;
mod model;
mod repository;

use self::{error::MyError, model::Transaction};

pub async fn get_transactions(db_pool: web::Data<Pool>) -> Result<HttpResponse, Error> {
    let client: Client = db_pool.get().await.map_err(MyError::PoolError)?;

    let transactions = repository::get_transactions(&client).await?;

    Ok(HttpResponse::Ok().json(transactions))
}

pub async fn add_transaction(
    transaction: web::Json<Transaction>,
    db_pool: web::Data<Pool>,
) -> Result<HttpResponse, Error> {
    let transaction_data: Transaction = transaction.into_inner();

    let client: Client = db_pool.get().await.map_err(MyError::PoolError)?;

    let new_transaction = repository::add_transaction(&client, transaction_data).await?;

    Ok(HttpResponse::Ok().json(new_transaction))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let config = Config::builder()
        .override_with(EnvSource::new())
        .try_build()
        .unwrap();

    let pool = config.pg.create_pool(None, NoTls).unwrap();

    let server = HttpServer::new(move || {
        App::new().app_data(web::Data::new(pool.clone())).service(
            web::resource("/transactions")
                .route(web::post().to(add_transaction))
                .route(web::get().to(get_transactions)),
        )
    })
    .bind(config.server_addr.clone())?
    .run();
    println!("Server running at http://{}/", config.server_addr);

    server.await
}
