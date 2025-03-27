export const validateURL = url => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

export const validateEmail = email => {
    const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return !!email.toLowerCase().match(EMAIL_REGEX)
}