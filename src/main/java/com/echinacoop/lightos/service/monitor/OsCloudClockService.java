package com.echinacoop.lightos.service.monitor;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.monitor.OsCloudClock;
import com.echinacoop.lightos.repository.monitor.OsCloudClockRepository;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

/**
 * 此类为[代码工厂]自动生成
 * 
 * @Desc 云闹钟
 * @Time 2018-08-30 09:40
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsCloudClockService {
	private final static Logger logger = LoggerFactory.getLogger(OsCloudClockService.class);

	@Autowired
	private OsCloudClockRepository repository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
		try {
			Long rowId = arg.getRowId();
			OsCloudClock obj = repository.findOne(rowId);
			if (obj != null) {
				arg.success().setObj(obj);
			} else {
				arg.fail();
			}
		} catch (Exception e) {
			logger.error("查询OsCloudClock数据失败：" + e.getMessage(), e);
			arg.fail("查询数据失败");
		}
		return arg;
	}
	
	@Transactional(readOnly = true)
	public Argument findAll() {
		Argument arg = new Argument();
		try {
			List<OsCloudClock> dataList = repository.findAll();
			if (dataList != null) {
				arg.success().setDataToRtn(dataList);
			} else {
				arg.fail();
			}
		} catch (Exception e) {
			logger.error("查询OsCloudClock数据失败：" + e.getMessage(), e);
			arg.fail("查询数据失败");
		}
		return arg;
	}

	@Transactional(readOnly = true)
	public Argument findAll(Argument arg) {
		try {
			Long userId = arg.getRowId();
			List<OsCloudClock> dataList = repository.selectClocks(userId);
			if (dataList != null) {
				arg.success().setDataToRtn(dataList);
			} else {
				arg.fail();
			}
		} catch (Exception e) {
			logger.error("查询OsCloudClock数据失败：" + e.getMessage(), e);
			arg.fail("查询数据失败");
		}
		return arg;
	}

	@Transactional(readOnly = true)
	public Argument findAllForPager(Argument arg) {
		try {
			Long userId = arg.getRowId();
			Pageable pageRequest = arg.getPageable();
			Page<OsCloudClock> page = repository.selectClocks(userId, pageRequest);
			if (page != null) {
				arg.success().setPage(page);
			} else {
				arg.fail();
			}
		} catch (Exception e) {
			logger.error("查询OsCloudClock数据失败：" + e.getMessage(), e);
			arg.fail("查询数据失败");
		}
		return arg;
	}

	public Argument save(Argument arg) {
		try {
			OsCloudClock entity = (OsCloudClock) arg.getObj();
			execTime(entity);
			entity = repository.save(entity);
			if (entity != null) {
				arg.success().setObj(entity);
			} else {
				arg.fail();
			}
		} catch (Exception e) {
			logger.error("新增OsCloudClock数据失败：" + e.getMessage(), e);
			arg.fail("新增数据失败");
			throw new RuntimeException("新增OsCloudClock数据失败");
		}
		return arg;
	}

	public Argument update(Argument arg) {
		try {
			OsCloudClock entity = (OsCloudClock) arg.getObj();
			execTime(entity);
			entity = repository.saveAndFlush(entity);
			if (entity != null) {
				arg.success().setObj(entity);
			} else {
				arg.fail();
			}
		} catch (Exception e) {
			logger.error("修改OsCloudClock数据失败：" + e.getMessage(), e);
			arg.fail("修改数据失败");
			throw new RuntimeException("修改OsCloudClock数据失败");
		}
		return arg;
	}

	public Argument delete(Argument arg) {
		try {
			repository.delete(arg.getRowId());
			arg.success();
		} catch (Exception e) {
			logger.error("删除OsCloudClock数据失败：" + e.getMessage(), e);
			arg.fail("删除数据失败");
			throw new RuntimeException("删除OsCloudClock数据失败");
		}
		return arg;
	}

	/**
	 * 计算下一次执行时间
	 * @param entity
	 */
	public void execTime(OsCloudClock entity) {
		String execTime = "";
		if (entity.getCycle().equals("time")) {
			execTime = "" + DateUtils.parse(entity.getDate() + " " + entity.getTime()).getTime();
		} else if (entity.getCycle().equals("day")) {
			int t1 = CommonUtils.stringToInt(entity.getTime().replaceAll(":", ""));
			int t2 = CommonUtils.stringToInt(DateUtils.format("HHmmss"));
			if (t1 > t2) { // 未到时间
				execTime = DateUtils.format("yyyy-MM-dd") + " " + entity.getTime();
				execTime = "" + DateUtils.parse(execTime).getTime();
			} else {
				execTime = DateUtils.format(DateUtils.getBeforeOrAfterDateByDayNumber(1), "yyyy-MM-dd") + " " + entity.getTime();
				execTime = "" + DateUtils.parse(execTime).getTime();
			}
		} else if (entity.getCycle().equals("week")) {
			int week = DateUtils.getWeek();
			if (week == 0) {
				week = 7;
			}
			String[] wks = entity.getDate().split(",");
			int day = 99, w = -1;
			for (int i = 0, k = wks.length; i < k; i++) {
				w = CommonUtils.stringToInt(wks[i]);
				if (week < w) {
					day = w - week;
					break;
				} else if(week == w){
					long currTime = System.currentTimeMillis();
					long time = CommonUtils.stringToLong(entity.getExecTime());
					if(currTime - time < 1001){
						day = 0;
						break;
					}
				}
			}
			if (day == 99) {
				day = 7 - week + CommonUtils.stringToInt(wks[0]);
			}

			if (day == 0) {
				execTime = DateUtils.format(new Date(), "yyyy-MM-dd") + " " + entity.getTime();
				execTime = "" + DateUtils.parse(execTime).getTime();
			} else {
				execTime = DateUtils.format(DateUtils.getBeforeOrAfterDateByDayNumber(day), "yyyy-MM-dd") + " " + entity.getTime();
				execTime = "" + DateUtils.parse(execTime).getTime();
			}
		} else if (entity.getCycle().equals("month")) {
			Calendar cal = Calendar.getInstance();
			cal.setTime(new Date());
			int d1 = cal.get(Calendar.DAY_OF_MONTH);
			int d2 = CommonUtils.stringToInt(entity.getDate());
			String date = DateUtils.format("yyyy-MM");
			if (d1 > d2) {
				int day = 30;
				if (d1 > 20) {
					day = 15;
				} else if (d1 < 5) {
					day = 35;
				}
				date = DateUtils.format(DateUtils.getBeforeOrAfterDateByDayNumber(day), "yyyy-MM") + "-" + entity.getDate();
			} else if (d1 == d2) {
				int t1 = CommonUtils.stringToInt(entity.getTime().replaceAll(":", ""));
				int t2 = CommonUtils.stringToInt(DateUtils.format("HHmmss"));
				if (t1 <= t2) { // 时间已过
					date = DateUtils.format(DateUtils.getBeforeOrAfterDateByDayNumber(1), "yyyy-MM-dd");
				}
			} else {
				date = date + "-" + entity.getDate();
			}
			execTime = "" + DateUtils.parse(date + " " + entity.getTime()).getTime();
		} else if (entity.getCycle().equals("year")) {
			String date = DateUtils.format("yyyy-MM-dd");
			String[] as = entity.getDate().split("-");
			int m1 = CommonUtils.stringToInt(as[0]);
			int d1 = CommonUtils.stringToInt(as[1]);
			Calendar cal = Calendar.getInstance();
			cal.setTime(new Date());
			int m2 = cal.get(Calendar.MONTH) + 1;
			int d2 = cal.get(Calendar.DAY_OF_MONTH);
			if(m1 > m2){ // 月份未到
				date = cal.get(Calendar.YEAR) + "-" + (m1 + 1) + "-" + d1;
			} else if(m1 == m2){
				if (d1 < d2) { // 日期未到
					date = cal.get(Calendar.YEAR) + "-" + entity.getDate();
				} else if (d1 == d2) {
					int t1 = CommonUtils.stringToInt(entity.getTime().replaceAll(":", ""));
					int t2 = CommonUtils.stringToInt(DateUtils.format("HHmmss"));
					if (t1 <= t2) { // 时间已过，到下一年
						date = (cal.get(Calendar.YEAR) + 1) + "-" + entity.getDate();
					}
				} else { // 日期你已过，到下一年
					date = (cal.get(Calendar.YEAR) + 1) + "-" + entity.getDate();
				}
			} else { // 月份已过，直接到下一年
				date = (cal.get(Calendar.YEAR) + 1) + "-" + entity.getDate();
			}
			execTime = "" + DateUtils.parse(date + " " + entity.getTime()).getTime();
		}
		entity.setExecTime(execTime);
	}

}