package com.echinacoop.lightos.config;

/**
 * Application constants.
 */
public final class Constants {

    // Regex for acceptable logins
    public static final String ACCOUNT_REGEX = "^[_A-Za-z0-9-]*$";

    public static final String SYSTEM_ACCOUNT = "system";
    public static final String ANONYMOUS_USER = "anonymoususer";
    public static final String DEFAULT_LANGUAGE = "en";
    
    private Constants() {
    }
}
