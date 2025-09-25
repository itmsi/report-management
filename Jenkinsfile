// Jenkinsfile untuk Core API MSI Server - Simple Update (Git Pull + NPM Install)
// Simpan sebagai Jenkinsfile di root repository

pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'  // Menggunakan tool NodeJS versi 22.17.0 yang sudah dikonfigurasi
    }
    
    stages {
        stage('Git Pull') {
            steps {
                echo '📥 Pulling latest code from repository...'
                sh '''
                    # Git pull latest changes
                    git pull origin develop || git pull origin main || git pull
                    echo "✅ Git pull completed successfully!"
                '''
            }
        }
        
        stage('Info') {
            steps {
                echo '📋 Project Information:'
                echo 'Repository: ' + env.JOB_NAME
                echo 'Branch: ' + env.BRANCH_NAME
                echo 'Build Number: ' + env.BUILD_NUMBER
                echo 'Workspace: ' + env.WORKSPACE
                echo 'Current commit:'
                sh 'git log --oneline -1 || echo "No git info available"'
            }
        }
        
        stage('Node.js Info') {
            steps {
                echo '🟢 Node.js Information:'
                sh 'node --version || echo "Node.js not installed"'
                sh 'npm --version || echo "npm not installed"'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing/updating dependencies...'
                sh '''
                    # Install dependencies
                    npm install
                    echo "✅ Dependencies installed successfully!"
                    
                    # Show installed packages count
                    echo "📊 Installed packages:"
                    npm list --depth=0 | wc -l || echo "Could not count packages"
                '''
            }
        }
        
        stage('Environment Check') {
            steps {
                echo '🔍 Checking environment configuration...'
                script {
                    if (!fileExists('.env')) {
                        echo '⚠️ Warning: .env file not found'
                        echo 'Make sure environment variables are configured properly'
                    } else {
                        echo '✅ .env file found'
                    }
                }
            }
        }
        
        stage('Verify Installation') {
            steps {
                echo '🔍 Verifying installation:'
                sh '''
                    # Check if node_modules exists and has content
                    if [ -d "node_modules" ]; then
                        echo "✅ node_modules directory exists"
                        echo "📊 Number of installed packages:"
                        ls node_modules | wc -l
                    else
                        echo "❌ node_modules directory not found"
                        exit 1
                    fi
                    
                    # Check package.json scripts
                    echo "📋 Available npm scripts:"
                    npm run --silent 2>/dev/null || echo "No scripts defined"
                '''
            }
        }
    }
    
    post {
        always {
            echo '✅ Pipeline completed!'
            echo 'Build finished at: ' + new Date().toString()
            echo 'Code updated and dependencies installed!'
        }
        
        success {
            echo '🎉 Success: Code updated and dependencies installed!'
            echo '📝 Next steps:'
            echo '   - Check if application is running properly'
            echo '   - Test API endpoints if needed'
            echo '   - Monitor application logs'
            
            // Show git status
            sh '''
                echo "📋 Current git status:"
                git status --short || echo "Could not get git status"
            '''
        }
        
        failure {
            echo '❌ Failed: Update process failed'
            echo '📋 Common issues to check:'
            echo '   - Network connection for git pull'
            echo '   - Node.js and npm versions'
            echo '   - Package.json file integrity'
            echo '   - Disk space availability'
        }
    }
}
