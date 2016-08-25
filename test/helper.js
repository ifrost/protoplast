var handlers = function(dispatcher, topic) {
    return dispatcher._topics[topic];
};

module.exports = {
   handlers: handlers 
};