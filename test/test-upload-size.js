/**
 * Script untuk menguji batasan ukuran file upload
 * 
 * Penggunaan:
 * node test-upload-size.js
 */

const fs = require('fs');
const path = require('path');

// Fungsi untuk membuat file dummy dengan ukuran tertentu
function createDummyFile(filename, sizeInMB) {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeInBytes, 'A'); // Isi dengan karakter 'A'
  
  fs.writeFileSync(filename, buffer);
  console.log(`✅ File ${filename} berhasil dibuat (${sizeInMB} MB)`);
}

// Fungsi untuk menghapus file dummy
function cleanupDummyFiles() {
  const files = ['test-50mb.pdf', 'test-500mb.pdf', 'test-1gb.pdf'];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  File ${file} berhasil dihapus`);
    }
  });
}

// Test cases
const testCases = [
  { name: '50 MB', size: 50, expected: 'success' },
  { name: '500 MB', size: 500, expected: 'success' },
  { name: '1 GB', size: 1024, expected: 'success' }
];

console.log('🚀 Memulai test batasan ukuran file upload...\n');

// Buat file dummy untuk testing
console.log('📁 Membuat file dummy untuk testing...');
testCases.forEach(testCase => {
  const filename = `test-${testCase.size}mb.pdf`;
  createDummyFile(filename, testCase.size);
});

console.log('\n📋 Test Cases:');
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name} (${testCase.size} MB) - Expected: ${testCase.expected}`);
});

console.log('\n📝 Instruksi Testing:');
console.log('1. Restart aplikasi dengan konfigurasi baru');
console.log('2. Test upload file menggunakan endpoint:');
console.log('   - POST /campaign-doctor-truck/');
console.log('   - POST /campaign-doctor-truck/public');
console.log('   - PUT /campaign-doctor-truck/:id');
console.log('   - POST /banks/');
console.log('   - PUT /banks/:id');
console.log('3. File yang dibuat:');
testCases.forEach(testCase => {
  const filename = `test-${testCase.size}mb.pdf`;
  console.log(`   - ${filename} (${testCase.size} MB)`);
});

console.log('\n⚠️  Catatan:');
console.log('- File 50 MB, 500 MB, dan 1 GB seharusnya berhasil upload');
console.log('- File > 1 GB seharusnya mendapat error "Ukuran file terlalu besar"');
console.log('- Upload lebih dari 10 file seharusnya mendapat error "Jumlah file terlalu banyak"');

console.log('\n🧹 Cleanup:');
console.log('Setelah testing selesai, jalankan:');
console.log('node test-upload-size.js cleanup');

// Handle cleanup command
if (process.argv[2] === 'cleanup') {
  console.log('\n🧹 Membersihkan file dummy...');
  cleanupDummyFiles();
  console.log('✅ Cleanup selesai!');
  process.exit(0);
}

console.log('\n✅ Script test siap! Jalankan aplikasi dan test upload file.'); 