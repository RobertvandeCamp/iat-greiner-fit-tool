#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IatGreinerFitToolStack } from '../lib/amplify-greiner-fit-tool-stack.js';

const app = new cdk.App();

const commonProps: cdk.StackProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-central-1',
  },
  tags: {
    Project: 'IAT',
    ManagedBy: 'CDK',
  },
};

new IatGreinerFitToolStack(app, 'IatGreinerFitToolStack', {
  ...commonProps,
  description: 'IAT Greiner Fit Tool - Amplify Hosting',
  tags: {
    ...commonProps.tags,
    Component: 'GreinerFitTool',
  },
});
