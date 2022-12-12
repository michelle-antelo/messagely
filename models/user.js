/** User class for message.ly */

const db = require("../db");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const result = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) RETURNING username, password, first_name, last_name, phone`,
        [username, password, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username, password FROM users
          WHERE username = $1`,
      [username]);

      let r = result.rows[0];

      return (r.password === password)
  }
      
  
  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
          SET last_login_at = current_timestamp
          WHERE username = $1`,
      [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`);
    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at 
          FROM users
          WHERE username = $1`,
      [username]);
    
    return result.rows[0]
  }
  

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
    `SELECT id, body, sent_at, read_at, to_username AS to_user
        FROM messages
        WHERE from_username  = $1`,
    [username]);

    const to_user = async (user) => {
      let results =  await db.query(
      `SELECT username, first_name, last_name, phone 
        FROM users
        WHERE username = $1`,
      [user]);

      return results.rows[0]
    } 
    let finalResults = result.rows.map(async row => {
      let user = await to_user(row.to_user)
      row.to_user = user
      return row
    })

    return Promise.all(finalResults)
  }

  

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
    `SELECT id, body, sent_at, read_at, from_username AS from_user
        FROM messages
        WHERE to_username  = $1`,
    [username]);

    const from_user = async (user) => {
      let results =  await db.query(
      `SELECT username, first_name, last_name, phone 
        FROM users
        WHERE username = $1`,
      [user]);

      return results.rows[0]
    } 
    let finalResults = result.rows.map(async row => {
      let user = await from_user(row.from_user)
      row.from_user = user
      return row
    })

    return Promise.all(finalResults) }
}


module.exports = User;