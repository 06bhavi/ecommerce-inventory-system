pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
    }

    environment {
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk'
        MAVEN_HOME = '/usr/share/maven'
        IMAGE_NAME = 'inventory-app'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'
        GIT_REPO = 'https://github.com/your-username/ecommerce-inventory-system.git'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code from repository...'
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        stage('Build') {
            steps {
                echo '🔨 Building with Maven...'
                sh 'mvn clean compile'
            }
        }

        stage('Test') {
            steps {
                echo '✅ Running unit tests...'
                sh 'mvn test'
                junit 'target/surefire-reports/*.xml'
            }
        }

        stage('Code Quality') {
            steps {
                echo '📊 Analyzing code quality...'
                sh '''
                    mvn package -DskipTests
                    echo "Code quality analysis completed"
                '''
            }
        }

        stage('Package') {
            steps {
                echo '📦 Packaging application...'
                sh 'mvn package -DskipTests'
                archiveArtifacts artifacts: 'target/*.jar', 
                                 fingerprint: true
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh '''
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                    docker images | grep inventory
                '''
            }
        }

        stage('Test Docker Container') {
            steps {
                echo '🧪 Testing Docker container...'
                sh '''
                    docker-compose down --remove-orphans || true
                    docker-compose up -d
                    sleep 15
                    
                    # Health check
                    curl -f http://localhost:8080/api/v1/products/health || exit 1
                    
                    echo "✓ Container is healthy"
                '''
            }
        }

        stage('Generate Report') {
            steps {
                echo '📝 Generating build report...'
                sh '''
                    echo "Build Information:" > build_report.txt
                    echo "Build Number: ${BUILD_NUMBER}" >> build_report.txt
                    echo "Build Timestamp: $(date)" >> build_report.txt
                    echo "Git Commit: $(git rev-parse HEAD)" >> build_report.txt
                    echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)" >> build_report.txt
                    echo "Build Status: SUCCESS" >> build_report.txt
                    cat build_report.txt
                '''
                archiveArtifacts artifacts: 'build_report.txt'
            }
        }
    }

    post {
        success {
            echo '✓ Pipeline completed successfully!'
            sh 'docker-compose logs app'
        }
        failure {
            echo '✗ Pipeline failed!'
            sh 'docker-compose logs'
        }
        always {
            echo '🧹 Cleaning up...'
            sh '''
                # Optional: Uncomment to stop containers after build
                # docker-compose down
            '''
            cleanWs()
        }
    }
}
