const { Kafka, logLevel } = require("kafkajs");

const kafka = new Kafka({
  clientId: "taskmaster-ms-auth",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["localhost:9092"],
  retry: {
    initialRetryTime: 1000,
    retries: 3,
    maxRetryTime: 5000
  },
  connectionTimeout: 10000,
  authenticationTimeout: 10000,
  logLevel: logLevel.NOTHING,
});

module.exports = kafka;
