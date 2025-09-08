/* eslint-disable implicit-arrow-linebreak */
/**
 * Seeder untuk mengupdate password Super Admin
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log('🔐 Updating Super Admin password...');
  
  try {
    // Password baru: Qwer1234!
    const newPassword = 'f5f87204216904da301f2e7e0590854ea8f3fb384a5e1ef3f6ed94700f65e159641bd0787afa16550a724240f526ac79c6fa2786896b5f655d8dee83a3fbee22';
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
      console.log('✅ Super Admin password updated successfully!');
      console.log('🔑 New login credentials:');
      console.log('   Username: superadmin');
      console.log('   Password: Qwer1234!');
    } else {
      console.log('❌ Super Admin user not found!');
    }
    
  } catch (error) {
    console.error('❌ Error updating Super Admin password:', error);
    throw error;
  }
};
