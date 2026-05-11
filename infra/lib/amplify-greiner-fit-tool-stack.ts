import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export class IatGreinerFitToolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const config = {
      githubOwner: 'RobertvandeCamp',
      githubRepo: 'iat-greiner-fit-tool',
      githubBranch: 'main',
    };

    // GitHub token from Secrets Manager
    const githubToken = secretsmanager.Secret.fromSecretNameV2(
      this,
      'GitHubToken',
      'github-token'
    );

    // Amplify App
    const amplifyApp = new amplify.App(this, 'IatGreinerFitToolApp', {
      appName: 'iat-greiner-fit-tool',
      description: 'IAT Greiner Fit Tool Application',

      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: config.githubOwner,
        repository: config.githubRepo,
        oauthToken: githubToken.secretValue,
      }),

      // Vite build spec
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: ['npm ci --prefer-offline --no-audit'],
            },
            build: {
              commands: ['npm run build'],
            },
          },
          artifacts: {
            baseDirectory: 'dist',
            files: ['**/*'],
          },
          cache: {
            paths: ['node_modules/**/*'],
          },
        },
      }),

      autoBranchDeletion: true,
    });

    // Main branch
    amplifyApp.addBranch(config.githubBranch, {
      branchName: config.githubBranch,
      stage: 'PRODUCTION',
      autoBuild: true,
    });

    // SPA rewrite rules for React Router
    amplifyApp.addCustomRule({
      source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>',
      target: '/index.html',
      status: amplify.RedirectStatus.REWRITE,
    });

    amplifyApp.addCustomRule({
      source: '/<*>',
      target: '/index.html',
      status: amplify.RedirectStatus.NOT_FOUND_REWRITE,
    });

    // Outputs
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.appId,
      description: 'Amplify App ID',
      exportName: 'IatGreinerFitToolAmplifyAppId',
    });

    new cdk.CfnOutput(this, 'AmplifyAppUrl', {
      value: `https://${config.githubBranch}.${amplifyApp.defaultDomain}`,
      description: 'Amplify Application URL',
      exportName: 'IatGreinerFitToolAmplifyAppUrl',
    });

    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://console.aws.amazon.com/amplify/home?region=${this.region}#/${amplifyApp.appId}`,
      description: 'Amplify Console URL',
    });
  }
}
