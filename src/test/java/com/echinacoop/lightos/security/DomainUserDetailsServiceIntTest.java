package com.echinacoop.lightos.security;

import com.echinacoop.lightos.LightosApp;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.repository.UserRepository;

import org.apache.commons.lang3.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test class for DomainUserDetailsService.
 *
 * @see DomainUserDetailsService
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = LightosApp.class)
@Transactional
public class DomainUserDetailsServiceIntTest {

    private static final String USER_ONE_LOGIN = "test-user-one";
    private static final String USER_ONE_EMAIL = "test-user-one@localhost";
    private static final String USER_TWO_LOGIN = "test-user-two";
    private static final String USER_TWO_EMAIL = "test-user-two@localhost";
    private static final String USER_THREE_LOGIN = "test-user-three";
    private static final String USER_THREE_EMAIL = "test-user-three@localhost";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsService domainUserDetailsService;

    private User userOne;
    private User userTwo;
    private User userThree;

    @Before
    public void init() {
        userOne = new User();
        userOne.setAccount(USER_ONE_LOGIN);
        userOne.setPassword(RandomStringUtils.random(60));
        userOne.setName("userOne");
        userOne.setMobile("");
        userOne.setEmail(USER_ONE_EMAIL);
        userOne.setCompany("gxyj");
        userOne.setDept("doe");
        userOne.setPosition("en");
        userOne.setWx("en");
        userOne.setQq("en");
        userOne.setRemark("en");
        userRepository.save(userOne);

        userTwo = new User();
        userOne.setAccount(USER_TWO_LOGIN);
        userOne.setPassword(RandomStringUtils.random(60));
        userOne.setName("userTwo");
        userOne.setMobile("");
        userOne.setEmail(USER_TWO_EMAIL);
        userOne.setCompany("gxyj");
        userOne.setDept("doe");
        userOne.setPosition("en");
        userOne.setWx("en");
        userOne.setQq("en");
        userOne.setRemark("en");
        userRepository.save(userTwo);

        userThree = new User();
        userOne.setAccount(USER_THREE_LOGIN);
        userOne.setPassword(RandomStringUtils.random(60));
        userOne.setName("userThree");
        userOne.setMobile("");
        userOne.setEmail(USER_THREE_EMAIL);
        userOne.setCompany("gxyj");
        userOne.setDept("doe");
        userOne.setPosition("en");
        userOne.setWx("en");
        userOne.setQq("en");
        userOne.setRemark("en");
        userRepository.save(userThree);
    }

    @Test
    @Transactional
    public void assertThatUserCanBeFoundByLogin() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_LOGIN);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatUserCanBeFoundByLoginIgnoreCase() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_LOGIN.toUpperCase(Locale.ENGLISH));
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatUserCanBeFoundByEmail() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_TWO_EMAIL);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_TWO_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatUserCanBeFoundByEmailIgnoreCase() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_TWO_EMAIL.toUpperCase(Locale.ENGLISH));
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_TWO_LOGIN);
    }

    @Test
    @Transactional
    public void assertThatEmailIsPrioritizedOverLogin() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_EMAIL.toUpperCase(Locale.ENGLISH));
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test(expected = UserNotActivatedException.class)
    @Transactional
    public void assertThatUserNotActivatedExceptionIsThrownForNotActivatedUsers() {
        domainUserDetailsService.loadUserByUsername(USER_THREE_LOGIN);
    }

}
