#!groovy

pipeline {
    agent {
        label 'hamsterbox'
    }

    post {
        always {
            cleanWs()
            deleteDir()
        }

        cleanup {
            script {
                sh '''
                    docker rmi -f "${REGISTRY_NAME}:${CURRENT_VERSION}-${GIT_BRANCH}"
                    docker rmi -f "test-${REGISTRY_NAME}:${CURRENT_VERSION}-${GIT_BRANCH}"
                    docker system prune --volumes -f
                '''
            }
        }
    }

    environment {
        // app env
        // Add something here

        // build info env
        GIT_BRANCH = "${GIT_BRANCH.split("/")[1]}"
        CURRENT_VERSION = sh(returnStdout: true, script: "git tag --sort version:refname | tail -1").trim()

        // credential id
        GITLAB_PUSH_SECRET = credentials('uid-gitlab-webhook-secret')
        REGISTRY_URL = credentials('registry-url-backend')

        // dokku deployment credential
        DOKKU_DEV_REMOTE = credentials('dokku-dev-remote-backend')
        DOKKU_PROD_REMOTE = credentials('dokku-prod-remote-backend')
        SSH_PRIVATE_KEY = credentials('dokku-deployment-private-key')
    }

    stages {
        stage('setup-parameters') {
            steps {
                gitlabCommitStatus('setup-parameters') {
                    script {
                        properties([
                                disableConcurrentBuilds([
                                        abortPrevious: true
                                ]),
                                parameters([
                                        booleanParam(
                                                defaultValue: false,
                                                description: 'Trigger a dokku deployment.',
                                                name: 'DOKKU_DEPLOY'
                                        )
                                ])
                        ])
                    }
                }
            }
        }

        stage('build-info') {
            steps {
                gitlabCommitStatus('build-info') {
                    echo 'Current branch: ' + env.GIT_BRANCH
                    echo 'Current version: ' + env.CURRENT_VERSION
                }
            }
        }

        stage('test') {
            steps {
                gitlabCommitStatus('test') {
                    script {
                        def image = docker.build("test-${env.REGISTRY_NAME}:${env.CURRENT_VERSION}-${env.GIT_BRANCH}", "-f Dockerfile.test ./")
                        image.inside {
                            sh 'yarn install'
                            sh 'yarn test'
                            sh 'yarn test:e2e'
                        }
                    }
                }
            }
        }

        stage('deploy') {
            agent {
                docker {
                    image 'dokku/ci-docker-image'
                    args '-v $PWD:/app'
                    reuseNode true
                }
            }

            when {
                expression {
                    params.DOKKU_DEPLOY == true && (env.GIT_BRANCH == 'develop' || env.GIT_BRANCH == 'main')
                }
            }

            steps {
                gitlabCommitStatus('deploy') {
                    sh 'echo "Deploying to ${GIT_BRANCH} environment ..."'
                    sh 'rm -rf .husky/'

                    script {
                        if (env.GIT_BRANCH == 'develop') {
                            sh '''
                            set +x
                            GIT_REMOTE_URL=${DOKKU_DEV_REMOTE} SSH_PRIVATE_KEY=$(cat ${SSH_PRIVATE_KEY}) dokku-deploy
                            set -x
                            '''
                        }

                        if (env.GIT_BRANCH == 'main') {
                            sh '''
                            set +x
                            GIT_REMOTE_URL=${DOKKU_PROD_REMOTE} SSH_PRIVATE_KEY=$(cat ${SSH_PRIVATE_KEY}) dokku-deploy
                            set -x
                            '''
                        }
                    }
                }
            }
        }
    }
}