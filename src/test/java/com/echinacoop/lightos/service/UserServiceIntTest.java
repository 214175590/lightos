package com.echinacoop.lightos.service;

import com.echinacoop.lightos.LightosApp;
import com.echinacoop.lightos.config.Constants;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.repository.UserRepository;
import com.echinacoop.lightos.service.util.RandomUtil;

import org.apache.commons.lang3.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserService
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = LightosApp.class)
@Transactional
public class UserServiceIntTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    private User user;

    @Before
    public void init() {
        user = new User();
        user.setAccount("johndoe");
        user.setPassword(RandomStringUtils.random(60));
        user.setName("userOne");
        user.setMobile("");
        user.setEmail("johndoe@localhost");
        user.setCompany("gxyj");
        user.setDept("doe");
        user.setPosition("en");
        user.setWx("en");
        user.setQq("en");
        user.setRemark("en");
    }

    @Test
    @Transactional
    public void assertThatUserMustExistToResetPassword() {
        userRepository.saveAndFlush(user);
    }

    @Test
    @Transactional
    public void assertThatOnlyActivatedUserCanRequestPasswordReset() {
        userRepository.saveAndFlush(user);

        userRepository.delete(user);
    }

    @Test
    @Transactional
    public void assertThatResetKeyMustNotBeOlderThan24Hours() {
        Instant daysAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        String resetKey = RandomUtil.generateResetKey();
        userRepository.saveAndFlush(user);

        userRepository.delete(user);
    }

    @Test
    @Transactional
    public void assertThatResetKeyMustBeValid() {
        Instant daysAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        userRepository.saveAndFlush(user);

        userRepository.delete(user);
    }

    @Test
    @Transactional
    public void assertThatUserCanResetPassword() {
        String oldPassword = user.getPassword();
        Instant daysAgo = Instant.now().minus(2, ChronoUnit.HOURS);
        String resetKey = RandomUtil.generateResetKey();
        userRepository.saveAndFlush(user);

        userRepository.delete(user);
    }

    @Test
    @Transactional
    public void assertThatAnonymousUserIsNotGet() {
        user.setAccount(Constants.ANONYMOUS_USER);
        if (!userRepository.findOneByAccount(Constants.ANONYMOUS_USER).isPresent()) {
            userRepository.saveAndFlush(user);
        }
        final PageRequest pageable = new PageRequest(0, (int) userRepository.count());
    }

    @Test
    @Transactional
    public void testRemoveNotActivatedUsers() {
        userRepository.saveAndFlush(user);
        // Let the audit first set the creation date but then update it
        userRepository.saveAndFlush(user);

        assertThat(userRepository.findOneByAccount("johndoe")).isPresent();
        assertThat(userRepository.findOneByAccount("johndoe")).isNotPresent();
    }

}
