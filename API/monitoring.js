
class Monitoring {
  constructor(prom, register) {
	register.setDefaultLabels({
		app: 'minitwit'
	})
	console.log('printing' + register)
	prom.collectDefaultMetrics({ register })

	this.request_counter = createMetric('minitwit_total_requests', register, prom)
	this.information_response_counter = createMetric('minitwit_information_response_counter', register, prom)
	this.success_response_counter = createMetric('minitwit_successful_response_counter', register, prom)
	this.redirect_response_counter = createMetric('minitwit_redirect_response_counter', register, prom)
	this.client_error_response_counter = createMetric('minitwit_client_error_response_counter', register, prom)
	this.server_error_response_counter = createMetric('minitwit_server_error_response_counter', register, prom)

	this.follow_request_counter = createMetric('minitwit_follow_request_counter', register, prom)
	this.follow_success_counter = createMetric('minitwit_follow_success_counter', register, prom)
	this.follow_failure_counter = createMetric('minitwit_follow_failure_counter', register, prom)
	
	this.unfollow_request_counter = createMetric('minitwit_unfollow_request_counter', register, prom)
	this.unfollow_success_counter = createMetric('minitwit_unfollow_success_counter', register, prom)
	this.unfollow_failure_counter = createMetric('minitwit_unfollow_failure_counter', register, prom)

	this.getFollows_request_counter = createMetric('minitwit_getFollows_request_counter', register, prom)
	this.getFollows_success_counter = createMetric('minitwit_getFollows_success_counter', register, prom)
	this.getFollows_failure_counter = createMetric('minitwit_getFollows_failure_counter', register, prom)

	this.register_request_counter = createMetric('minitwit_register_request_counter', register, prom)
	this.register_success_counter = createMetric('minitwit_register_success_counter', register, prom)
	this.register_failure_counter = createMetric('minitwit_register_failure_counter', register, prom)

	this.getMessages_request_counter = createMetric('minitwit_getMessages_request_counter', register, prom)
	this.getMessages_success_counter = createMetric('minitwit_getMessages_success_counter', register, prom)
	this.getMessages_failure_counter = createMetric('minitwit_getMessages_failure_counter', register, prom)

	this.getMessages_username_request_counter = createMetric('minitwit_getMessages_username_request_counter', register, prom)
	this.getMessages_username_success_counter = createMetric('minitwit_getMessages_username_success_counter', register, prom)
	this.getMessages_username_failure_counter = createMetric('minitwit_getMessages_username_failure_counter', register, prom)

	this.messages_request_counter = createMetric('minintwit_messages_request_counter', register, prom)
	this.messages_success_counter = createMetric('minintwit_messages_success_counter', register, prom)
	this.messages_failure_counter = createMetric('minintwit_messages_failure_counter', register, prom)

	this.msgs_response_time = createHistogramMetric('msgs_response_time', register, prom)
	this.msgs_username_response_time = createHistogramMetric('msgs_username_response_time', register, prom)
	this.register_response_time = createHistogramMetric('register_response_time', register, prom)
	this.getFollows_response_time = createHistogramMetric('getFollows_response_time', register, prom)

  }
}

function createMetric(metricName, register, prom) {
  const metric = new prom.Counter({
	name: metricName,
	help: 'metric_help',
	registers: [register]
  });
  register.registerMetric(metric)
  return metric;
}

function createHistogramMetric(metricName, register, prom) {
  const metric = new prom.Histogram({
	name: metricName,
	help: 'duration',
	registers: [register],
	buckets: [1, 5, 10, 15, 20, 25, 30]
  });
  register.registerMetric(metric)
  return metric;
}

module.exports.Monitoring = Monitoring
