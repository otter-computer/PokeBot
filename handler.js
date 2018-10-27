'use strict';
const mysql = require('mysql');

function createConnection() {

  let connection = mysql.createConnection({
    host: process.env.rds_host,
    user: process.env.rds_user,
    password: process.env.rds_password,
    database: process.env.rds_db,
    port: '3306',
    debug: false
  });

  return connection;
}

function doQuery(connection, query, callback) {

  connection.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(rows);
    }
  });

}

exports.getInfo = (event, context, callback) => {

  let connection = createConnection();
  let sql = `SELECT
    xp_totals.userId AS userId,
    xp_totals.guildId AS guildId,
    xp_totals.teamName AS teamName,
    xp_totals.totalxp AS totalxp,
    FIND_IN_SET(xp_totals.totalxp,
      (SELECT
              GROUP_CONCAT(xp_totals.totalxp
                      ORDER BY xp_totals.totalxp DESC
                      SEPARATOR ',')
          FROM
              xp_bot.xp_totals
          WHERE xp_totals.guildId = ${event.guildId}
      )) AS rank
    FROM
        xp_bot.xp_totals
    WHERE xp_totals.guildId = ${event.guildId} *USERFILTER*
    ORDER BY rank ASC`;

  if (event.userId) {
    let userFilter = `AND userId = ${event.userId}`;
    sql = sql.replace('*USERFILTER*', userFilter);
  }
  else {
    let userFilter = '';
    sql = sql.replace('*USERFILTER*', userFilter);
  }

  doQuery(connection, sql, function (response){
    connection.destroy();
    context.succeed(response);
  });
};

exports.getInfoActions = (event, context, callback) => {
  let connection = createConnection();
  let sql = `SELECT * FROM xp_bot.xp WHERE xp.userId = ${event.userId} AND xp.guildId = ${event.guildId} ORDER BY xp.timestamp DESC LIMIT 5`;

  doQuery(connection, sql, function (response){
    connection.destroy();
    context.succeed(response);
  });
};

exports.addXp = (event, context, callback) => {
  let connection = createConnection();
  let sql = 'INSERT INTO xp_bot.xp (userId, guildId, teamName, xp, type) VALUES ?';
  let inserts = [event.data];
  let query = mysql.format(sql, inserts);

  doQuery(connection, query, function (response){
    connection.destroy();
    context.succeed(response);
  });
};
