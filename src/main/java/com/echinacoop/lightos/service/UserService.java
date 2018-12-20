package com.echinacoop.lightos.service;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.config.ApplicationProperties;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.repository.UserRepository;
import com.yinsin.utils.CommonUtils;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {
	
	private final Logger log = LoggerFactory.getLogger(UserService.class);

	private final UserRepository userRepository;
	private final ApplicationProperties properties;

	public UserService(UserRepository userRepository, ApplicationProperties properties) {
		this.userRepository = userRepository;
		this.properties = properties;
	}
	
	@PersistenceContext
	private EntityManager em;

	public Argument getUser(Argument arg) {
		User user = (User) arg.getObj();
		try {
			User userVo = null;
			if (user.getRowId() != null && user.getRowId() > 0) {
				userVo = userRepository.findOne(user.getRowId());
			} else if (CommonUtils.isNotBlank(user.getAccount())) {
				userVo = userRepository.findOneByAccount(user.getAccount()).get();
			}
			if (null != userVo) {
				arg.success().setObj(userVo);
			}
		} catch (Exception e) {
			arg.fail(e.getMessage());
		}
		return arg;
	}
	
	public Argument getAllUserList(Argument arg) {
		try {
			List<User> list = userRepository.findAll();
			if (null != list) {
				arg.success().setDataToRtn(list);
			}
		} catch (Exception e) {
			arg.fail(e.getMessage());
		}
		return arg;
	}
	
	public Argument modifyPassword(Argument arg) {
		User user = (User) arg.getObj();
		try {
			log.debug("Reset user password for reset key {}", user);
			User user2 = userRepository.findOne(user.getRowId());
			if (null != user2) {
				user2.setPassword(user.getPassword());
				user2 = userRepository.save(user2);
				if (null != user2) {
					arg.success();
				}
			}
		} catch (Exception e) {
			arg.fail("修改密码异常：" + e.getMessage());
			log.error("修改密码时异常：" + user.getAccount(), e);
		}
		return arg;
	}

	public Argument resetPassword(Argument arg) {
		User user = (User) arg.getObj();
		try {
			log.debug("Reset user password for reset key {}", user);
			User user2 = userRepository.findOneByAccount(user.getAccount()).get();
			if (null != user2) {
				user2.setPassword(properties.getDefaultPassword());
				user2 = userRepository.save(user2);
				if (null != user2) {
					arg.success();
				}
			}
		} catch (Exception e) {
			arg.fail("修改密码异常：" + e.getMessage());
			log.error("修改密码时异常：" + user.getAccount(), e);
		}
		return arg;
	}

	public Argument saveUser(Argument arg) {
		User userDTO = (User) arg.getObj();
		try {
			userDTO.setPassword(properties.getDefaultPassword());
			User newUser = userRepository.save(userDTO);
			if (null != newUser) {
				arg.success().setObj(newUser);
			}
			log.debug("Created Information for User: {}", newUser);
		} catch (Exception e) {
			arg.fail("保存用户信息异常：" + e.getMessage());
			log.error("保存用户信息时异常：" + userDTO.getAccount(), e);
		}
		return arg;
	}

	public Argument deleteUser(Argument arg) {
		try {
			User user = userRepository.findOne(arg.getRowId());
			if (null != user) {
				userRepository.delete(user);
				arg.success();
			}
			log.debug("Deleted User: {}", user);
		} catch (Exception e) {
			arg.fail("删除用户异常：" + e.getMessage());
			log.error("删除用户时异常：" + arg.getRowId(), e);
		}
		return arg;
	}

	@Transactional(readOnly = true)
	public Argument getAllUsers(Argument arg) {
		Pageable pageRequest = arg.getPageable(); 
		User user = (User) arg.getObj();
		StringBuilder sql1 = new StringBuilder("SELECT e from User e where 1 = 1 ");
        StringBuilder sql2 = new StringBuilder("SELECT count(e) from User e where 1 = 1 ");
        
        if(CommonUtils.isNotBlank(user.getAccount())){
        	sql1.append(" and e.account like ?1 ");
        	sql2.append(" and e.account like ?1 ");
        }
        if(CommonUtils.isNotBlank(user.getName())){
        	sql1.append(" and e.name like ?2 ");
        	sql2.append(" and e.name like ?2 ");
        }
        if(CommonUtils.isNotBlank(user.getCompany())){
            sql1.append(" and e.company = ?3");
            sql2.append(" and e.company = ?3");
        }
        
        Query query1 = em.createQuery(sql1.toString());
        query1.setFirstResult(pageRequest.getPageSize() * pageRequest.getPageNumber());
        query1.setMaxResults(pageRequest.getPageSize());
        
        Query query2 = em.createQuery(sql2.toString());
        
        if(CommonUtils.isNotBlank(user.getAccount())){
        	query1.setParameter(1, "%" + user.getAccount() + "%");
        	query2.setParameter(1, "%" + user.getAccount() + "%");
        }
        if(CommonUtils.isNotBlank(user.getName())){
        	query1.setParameter(2, "%" + user.getName() + "%");
        	query2.setParameter(2, "%" + user.getName() + "%");
        }
        if(CommonUtils.isNotBlank(user.getCompany())){
        	query1.setParameter(3, user.getCompany());
        	query2.setParameter(3, user.getCompany());
        }
		
		List<User> list = query1.getResultList();
        if(list != null){
        	Long total = CommonUtils.objectToLong(query2.getSingleResult());
        	PageImpl<User> pageImpl = new PageImpl<User>(list, pageRequest, total);
        	arg.success().setPage(pageImpl);
        } else {
        	arg.fail();
        }
		return arg;
	}

}
