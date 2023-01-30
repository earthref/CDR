import CommonMethods from './common';
import CDRMethods from './cdr';
import ElasticSearchMethods from './es';
import S3SearchMethods from './s3';

export default function () {
  CommonMethods();
  CDRMethods();
  ElasticSearchMethods();
  S3SearchMethods();
}