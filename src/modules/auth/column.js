const TABLE = 'users';
const TABLE_JOIN = 'roles';
const COLUMN = [
  `${TABLE}.user_id as users_id`,
  `${TABLE}.user_name as full_name`,
  `${TABLE}.is_delete as status`,
  `${TABLE}.user_password as password`,
  `${TABLE}.salt`,
  `${TABLE_JOIN}.role_name`,
];
const COLUMN_ME = [
  `${TABLE}.user_id as users_id`,
  `${TABLE}.user_name as full_name`,
  `${TABLE_JOIN}.role_name`,
  `${TABLE}.role_id`,
];

module.exports = {
  TABLE,
  TABLE_JOIN,
  COLUMN,
  COLUMN_ME,
};
