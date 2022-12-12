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
      `SELECT * FROM users`);
    return result.rows.map(u => {
      return {
        username: u.username,
        first_name: u.first_name,
        last_name: u.last_name,
        phone: u.phone
      }
    });
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
      `SELECT * FROM users
          WHERE username = $1`,
      [username]);
    
      let r = result.rows[0]
    return {
      username: r.username,
      first_name: r.first_name,
      last_name: r.last_name,
      phone: r.phone,
      join_at: r.join_at,
      last_login_at: r.last_login_at
    };
  }
  

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;