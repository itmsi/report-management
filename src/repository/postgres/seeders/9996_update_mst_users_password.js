/* eslint-disable implicit-arrow-linebreak */
/**
 * Seeder untuk mengupdate password Super Admin di tabel mst_users
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log('🔐 Updating Super Admin password in mst_users...');
  
  try {
    // Password baru: Qwer1234! dengan algoritma yang benar (100 bytes)
    const newPassword = 'f5f87204216904da301f2e7e0590854ea8f3fb384a5e1ef3f6ed94700f65e159641bd0787afa16550a724240f526ac79c6fa2786896b5f655d8dee83a3fbee22ba1441b0f1b7d97f6030f4709f2e6501949838185f022886d1264f71580ff2bd8164b2cd';
    const newSalt = '8c256117a2608fdac000d39223865fc9';
    
    // Update password super admin
    const updatedRows = await knex('mst_users')
      .where('username', 'superadmin')
      .update({
        password: newPassword,
        salt: newSalt,
        updated_at: new Date().toISOString()
      });
    
    if (updatedRows > 0) {
      console.log('✅ Super Admin password updated successfully in mst_users!');
      console.log('🔑 New login credentials:');
      console.log('   Username: superadmin');
      console.log('   Password: Qwer1234!');
    } else {
      console.log('❌ Super Admin user not found in mst_users!');
    }
    
  } catch (error) {
    console.error('❌ Error updating Super Admin password:', error);
    throw error;
  }
};
