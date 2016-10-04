var handlers = function(dispatcher, topic) {
    var result = [];

    for (var dispatcherTopic in dispatcher._topics) {
        if (dispatcher._topics.hasOwnProperty(dispatcherTopic) && (!topic || dispatcherTopic === topic)) {
            result = result.concat(dispatcher._topics[dispatcherTopic] || [])
        }
    }

    return result;
};

module.exports = {
    handlers: handlers
};