/* eslint-disable implicit-arrow-linebreak */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  // Deletes ALL existing entries
  const data = [
    {
      users_id: '73d05c65-1567-433b-83bb-4f5c4d692335',
      location_id: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      role_id: 'd91f74b0-2e7d-4f86-a1aa-727d6ea3ac21',
      username: 'admin',
      email: 'info@mail.com',
      password: 'a22512591ddc3de03193be8a23d9c6be62959c29ed524c75962684b72a8824c2ee1bf5a3920e98a6eb2f548089608374cd5fba96e3a12e26563034376a9239c14b6cb069544bd1ef6fe580c5b17bf805f7f2cf8bb9b7517612cc9e97a0e1d12a61b80bf0',
      salt: 'dbe2be1f86881e5d53fe1638e30b154f',
      full_name: 'Administrator',
      jabatan: '',
      phone_number: '',
      status: '1',
      created_at: '2022-10-17 15:55:36.710 +0700',
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      users_id: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      location_id: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      role_id: 'd91f74b0-2e7d-4f86-a1aa-727d6ea3ac21',
      username: 'branding',
      email: 'branding@mail.com',
      password: 'a22512591ddc3de03193be8a23d9c6be62959c29ed524c75962684b72a8824c2ee1bf5a3920e98a6eb2f548089608374cd5fba96e3a12e26563034376a9239c14b6cb069544bd1ef6fe580c5b17bf805f7f2cf8bb9b7517612cc9e97a0e1d12a61b80bf0',
      salt: 'dbe2be1f86881e5d53fe1638e30b154f',
      full_name: 'Administrator Branding',
      jabatan: '',
      phone_number: '',
      status: '1',
      created_at: '2022-10-17 15:55:36.710 +0700',
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    }
  ]
  return knex('mst_users').del()
    .then(() =>
      // Inserts seed entries
      knex('mst_users').insert(data));
};
