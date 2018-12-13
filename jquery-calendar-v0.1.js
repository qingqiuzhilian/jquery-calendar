/**
 * name: 简易万年历控件(micro-calendar.js)
 * version:	v_0.1
 * author: qingqiu
 * mail: 393067996@qq.com
 * refer: jQuery, zTree
 * description: 该万年历控件基于从网上扒来的万年历部分代码改造，主要功能：
 * 1.支持公历，农历，节气，节日（公历节日，农历节日）
 * 2.支持标注工作日（休息，上班，加班，调休，请假）
 * 3.支持多种显示视图（当月，当月和前后月末月初）
 * 4.支持简单方法调用和事件
 * REMARK：	个人能力和时间有限，欢迎指正和意见！感谢！
 * date: 2018-12-03
 */
;(function($){
	/*
	 * 当前日期<br/>
	 * tY: 当前年份
	 * tM: 当前月份
	 * tD: 当前日
	 */
	var _today = new Date();
	var Today = {
		tY: _today.getFullYear(),
		tM: _today.getMonth(),
		tD: _today.getDate()
	};
	/*
	* 农历年天数计算模板，从1900年开始
	* 农历年中：大月份30天/月，小月份29天/月，如果y年是闰年，会闰某一个月份
	* lunarInfo表示y年有无闰月
	* 如果有：闰几月，闰大月还是小月
	* 如果无：其他月份是大月还是小月
	* ============================================
	* 下列的每个数据均由5位的16进制字符组成，5位分别如下5组4位二进制对应（下列组合暂且叫“lunar模板”）
	* 	xxxx	xxxx	xxxx	xxxx	xxxx
	*	20-17	16-12	12-9	8-5		4-1
	*【说明】
	*1-4: 表示当年有无闰年，有的话，为闰月的月份，没有的话，为0
	*5-16：为除了闰月外的正常月份是大月还是小月，1为30天，0为29天。
	*【注意】从1月到12月对应的是第16位到第5位。
	*17-20： 表示闰月是大月还是小月，仅当存在闰月的情况下有意义
	* ------------------------------------------
	*Ex1: 1980年，对应的是0x095b0，转成二进制如下：
	*	十六进制 	0		9		5		b		0
	*	二进制		0000	1001	0101	1011	0000
	*结论：
	*1980年没有闰月（最后一组是0000）
	*1到12月份分别对应的天数30,29,29,30,29,30,29,30,30,29,30,30
	*Ex2: 1982年，对应的是0x0a974，转成二进制如下：
	*	十六进制 	0		a		9		7		4
	*	二进制		0000	1010	1001	0111	0100
	*结论：
	*1982年有闰月（最后一组是0100），闰4月，且是闰小月份（29天）
	*1到12月份分别对应的天数30,29,30,29,29(闰四月),30,29,29,30,29,30,30,30
	* ============================================
	* 可以说lunarInfo的长度决定了当前日历农历的可显示时间起止点
	*/
	var lunarInfo = new Array(
			0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
			0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
			0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
			0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
			0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
			0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
			0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
			0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
			0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
			0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
			0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
			0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
			0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
			0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
			0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
			0x14b63);
	solarMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31),
	/* 天干*/
	Gan = new Array("甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"),
	/* 地址*/
	Zhi = new Array("子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"),
	Animals = new Array("鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"),
	/* 24节气数组，1900年第一个节气是小寒*/
	solarTerm = new Array("小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"),
	/* 各个节气与小寒的时间差，单位分钟*/
	sTermInfo = new Array(0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758);
	/* 农历“日”名称*/
	var nStr1 = new Array('日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'),
	/* 农历“日”名称前缀*/
	nStr2 = new Array('初', '十', '廿', '卅', ' '),
	/* 农历“月份”名称*/
	monthName = new Array("正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月");
	//国历节日  *表示放假日
	var sFtv = new Array(
	        "0101*元旦",
	        "0214  情人节",
	        "0303  全国爱耳日",
	        "0308  妇女节",
	        "0312  植树节",
	        "0315  消费者权益保护日",
	        "0321  世界森林日",
	        "0401  愚人节",
	        "0407  世界卫生日",
	        "0501*国际劳动节",
	        "0504  中国青年节",
	        "0508  世界红十字日",
	        "0519  汶川地震哀悼日",
	        "0531  世界无烟日",
	        "0601  国际儿童节",
	        "0623  国际奥林匹克日",
	        "0626  国际反毒品日",
	        "0701  建党节 香港回归",
	        "0707  抗日战争纪念日",
	        "0711  世界人口日",
	        "0801  八一建军节",
	        "0815  日本宣布无条件投降",
	        "0909  毛泽东逝世纪念日",
	        "0910  教师节",
	        "0918  九·一八事变纪念日",
	        "0920  国际爱牙日",
	        "0928  孔子诞辰",
	        "1001*国庆节",
	        "1010  辛亥革命纪念日",
	        "1031  万圣节",
	        "1110  世界青年节",
	        "1117  国际大学生节",
	        "1201  世界艾滋病日",
	        "1212  西安事变纪念日",
	        "1213  南京大屠杀",
	        "1220  澳门回归纪念日",
	        "1224  平安夜",
	        "1225  圣诞节",
	        "1226  毛泽东诞辰")
	//农历节日  *表示放假日
	var lFtv = new Array(
	        "0101*春节",
	        "0102*初二",
	        "0103*初三",
	        "0104*初四",
	        "0105*初五",
	        "0106*初六",
	        "0107*初七",
	        "0115  元宵节",
	        "0202  龙抬头",
	        "0404  寒食节",
	        "0408  佛诞节 ",
	        "0505*端午节",
	        "0606  天贶节",
	        "0707  七夕情人节",
	        "0714  鬼节(南方)",
	        "0715  中元节",
	        "0815*中秋节",
	        "0909  重阳节",
	        "1001  祭祖节",
	        "1208  腊八节",
	        "1223  过小年",
	        "1229*腊月二十九",
	        "0100*除夕");
	/*
	 * 月周节日，某月的第几个星期几<br/>
	 * 第三位数字：
	 * 1,2,3,4 表示第1,2,3,4 个星期几<br/>
	 * 5,6,7,8 表示到数第 1,2,3,4 个星期几<br/>
	 * Ex:0150表示1月份，最后一个（倒数第1个）周日
	 */
	var wFtv = new Array(
	        "0150  世界麻风日",
	        "0520  母亲节",
	        "0530  全国助残日",
	        "0630  父亲节",
	        "1144  感恩节");
	var settings={}
	,_setting = {
		calendarId: ""
		,url: null
		,isSuccessive: false
		,festival: {
			lunarFestival: lFtv	// 农历节日
			,solarFestival: sFtv// 公历节日
			,weekFestival: wFtv	// 周节日
			,isMerge: true		// 是否与默认节日合并（true:默认合并,false:覆盖）
		}
		,callback: {
			onClick: null		// 点击日历日期单元格时触发的事件
			,dateChange: null	// 日历发生切换时触发的事件
		}
	}
	,tools = {
		apply: function(fun, param, defaultValue) {
				if ((typeof fun) == "function") {
					return fun.apply(cdr, param?param:[]);
				}
				return defaultValue;
		}
		,clone: function (jsonObj) {
			var buf;
			if (jsonObj instanceof Array) {
				buf = [];
				var i = jsonObj.length;
				while (i--) {
					buf[i] = arguments.callee(jsonObj[i]);
				}
				return buf;
			}else if (typeof jsonObj == "function"){
				return jsonObj;
			}else if (jsonObj instanceof Object){
				buf = {};
				for (var k in jsonObj) {
					buf[k] = arguments.callee(jsonObj[k]);
				}
				return buf;
			}else{
				return jsonObj;
			}
		}
	}
	,_bindEvent = function(setting) {
		if(setting && setting.callback){
			if(setting.callback.onClick)
			if(typeof setting.callback.onClick=='function'){
				var cldModel = cdr.calendar;
				var preModel = cdr.preCalendar;
				var nextModel = cdr.nextCalendar;
				for (var i = 0; i < 42; i++) {
		        	var GD = cdr.view.gridDays.days[i];
			        var sD = i - cldModel.firstWeek;
			        // 当月日期内
			        if (sD > -1 && sD < cldModel.length) {  
				        // 注册点击事件
				        var dayCld = cldModel[sD];
				        (function(GD,dayCld,cldModel){
				        	GD.unbind('click').click(dayCld,function(){
				        		tools.apply(cdr.setting.callback.onClick, [$(this),dayCld,cldModel]);
				        	})
							})(GD,dayCld,cldModel);
			        }else if(setting.isSuccessive){
			        	// 上个月
				        if(sD <= 0){
				        	var p_sD = preModel.length + sD;
				        	// 注册点击事件
					        var dayCld = preModel[p_sD];
					        (function(GD,dayCld,cldModel){
					        	GD.unbind('click').click(dayCld,function(){
					        		tools.apply(cdr.setting.callback.onClick, [$(this),dayCld,cldModel]);
					        	})
								})(GD,dayCld,preModel);
				        	
				        }
				        // 下个月
				        else if(sD >= cldModel.length){
							var n_sD = sD - cldModel.length;
							// 注册点击事件
					        var dayCld = nextModel[n_sD];
					        (function(GD,dayCld,cldModel){
					        	GD.unbind('click').click(dayCld,function(){
					        		tools.apply(cdr.setting.callback.onClick, [$(this),dayCld,cldModel]);
					        	})
								})(GD,dayCld,nextModel);
				        }
			        }
				}
			}else{
				throw new Error("onClick未指定函数引用");
			}
		}
		
	};
	$.fn.Calendar = {
		// 常量
		WorkDayType:{
			HOLIDAY: "holiday"	// 休息
			,WORKDAY: "workday"	// 上班
			,OFFWORK: "offwork"	// 请假
			,TAKEOFF: "takeoff"	// 调休
			,OVERTIME:	"overtime"	// 加班
			,BUSINESSTRIP: "businesstrip"	// 出差
		}
		// 历法类型
		,CalendarType: {
			SOLAR: "solar"	// 阳历
			,LUNAR:	"lunar"	// 农历
		}
		,calendar: null		// 当前日历数据模型对象
		,preCalendar: null	// 上个月的数据模型对象
		,nextCalendar: null	// 下个月的数据模型对象
		,view: null		// 网格头面板
		,setting: null
		,workDays: []		// 远程服务器返回的工作日数组
		// 初始化日历网格界面
		,init: function(obj, cSetting){
			var ele_name = obj[0].tagName.toLowerCase();	// obj元素名称
			if(ele_name != 'table'){
				return;
			}
		    // 禁止日历区域的鼠标选取功能
		    obj.bind("selectstart", function(){return false;});
		    // 禁止日历区域的鼠标右键功能
		    obj.bind("contextmenu", function(){return false;});

			var setting = tools.clone(_setting);
			$.extend(true, setting, cSetting);
			setting["cdrObj"] = obj;
			
			if(cSetting.festival 
					&& cSetting.festival.isMerge!=undefined 
					&& !cSetting.festival.isMerge){
				$.extend(setting.festival, cSetting.festival);
			}
			this.setting = setting;
			
			// 初始化日历网格头
			this.view = View.ini(obj);
			// 初始化日历网格
			View.iniGrid(this.setting.cdrObj);
		    // 输出tY,tM日历数据到页面
		    this.drawCld(Today.tY, Today.tM);
		    // 远程加载工作日或休息日
		    if(this.setting.url && this.setting.url!=""){
		    	this.refreshWorkDayMonth(this.setting.url, global.currYear, global.currMonth);
		    }
		    
		    var that = this;
		    var CalendarTool = {
		    	setting: setting
		    	,global: global
		    	,WorkDayType: that.WorkDayType
		    	,CalendarType: that.CalendarType
		    	,workDays: that.workDays
		    	// 画指定年，月的日历视图
		    	,drawCalendar: function(sY, sM){
		    		// sY,sM数值转换处理
		    		if(!/^\d{4}$/.test(sY) || !/^\d{1,2}$/.test(sM)){
		    			throw new Error('年月参数异常');
		    		}else{
		    			sY = parseInt(sY);
		    			sM = parseInt(sM);
		    		}
		    		// 日历视图切换
		    		var dateChange_flag = false;
		    		if(sY!=global.currYear || sM!=global.currMonth){
		    			dateChange_flag = true;
		    		}
		    		// 刷新日历日期面板数据
		    		that.drawCld(sY, sM);
		    		
		    		// 触发事件
					if(dateChange_flag && cdr.setting && cdr.setting.callback){
						if(typeof cdr.setting.callback.dateChange=='function'){
							tools.apply(cdr.setting.callback.dateChange, [sY, sM]);
						}
					}
		    	}
		    	// 切换年份
		    	,goYear: function(pY){
		    		if(/\d{4}/.test(pY) && !isNaN(pY) && pY>=global.minYear && pY<=global.maxYear){
			    		this.drawCalendar(pY, global.currMonth);	
		    		}else{
		    			throw new Error("年份数值有误");
		    		}
		    	}
		    	// 切换月份[1-12]
		    	,goMonth: function(pM){
		    		if(/\d{1,2}/.test(pM) && !isNaN(pM) && pM>=1 && pM<=12){
			    		this.drawCalendar(global.currYear, pM-1);	
		    		}else{
		    			throw new Error("月份数值有误");
		    		}
		    	}
		    	// 切换到当前年月视图
		    	,goToday: function(){
		    		if(global.currYear!=Today.tY || global.currMonth!=Today.tM)
		    			this.drawCalendar(Today.tY, Today.tM);
		    	}
		    	// 设置工作日（上班，休息，请假，调休，加班...）
		    	,setWorkDay: function($day, dayType){
		    		that.setWorkDay($day, dayType);
		    	}
		    	// 获取td的jquery对象by 日期(公历,sm[1-12])
		    	,getGridSDay: function(sy,sm,sd){
		    		if(/^\d{4}[-/]?\d{2}[-/]?\d{2}$/.test(sy) && sy.match(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})$/)){
		    			sy = RegExp.$1;
		    			sm = RegExp.$2;
		    			sd = RegExp.$3;
		    		}
		    		return that.view.getGridDay(sy,sm,sd,that.CalendarType.SOLAR);
		    	}
		    	// 获取td的jquery对象by 日期(农历,sm[1-12])
		    	,getGridLDay: function(sy,sm,sd){
		    		return that.view.getGridDay(sy,sm,sd,that.CalendarType.LUNAR);
		    	}
		    	// 获取td的日期DayElement对象(sm,sd公历月，日)
		    	,getDayBySDay: function(sm,sd){
					var cldModel = cdr.calendar;
					var preModel = cdr.preCalendar;
					var nextModel = cdr.nextCalendar;
					// 默认是当前月份视图
					var dayEle = null;
					$.each(cldModel, function(i,v){
						if(v.sMonth == sm && v.sDay == sd){
							dayEle = v;
							return false;
						}
					});
					return dayEle;
		    	}
		    	
		    };
		    return CalendarTool;
		}
		/*输出SY, SM对应年月的公历和农历日期数据到页面
		 * SY: 4位数字
		 * SM: [0-11]
		 */ 
		,drawCld: function(SY, SM){
			// 清理日历页面数据
		    clear();
		    // 显示当前年月
		    if(/\d{4}/.test(SY)){
		    	this.view.yearPanel.html(SY);
		    	global.currYear = SY;
		    }
		    else this.view.yearPanel.html(Today.tY);;
		    if(/\d{1,2}/.test(SM)){
		    	var view_month = (parseInt(SM)+1)<10?'&nbsp;'+(parseInt(SM)+1):parseInt(SM)+1;
		    	this.view.monthPanel.html(view_month);
		    	global.currMonth = SM;
		    }
		    else this.view.monthPanel.html(Today.tM+1);
		    
			// 初始化指定年，月的日历模型数据对象
		    var cld = new CalendarModel(SY, SM);
		    this.calendar = cld;
		    // 上一个月的CalendarModel对象
		    var preCld = null;
		    // 下一个月的CalendarModel对象
		    var nextCld = null;
		    if(this.setting.isSuccessive){ 
		    	if(SM-1 < 0)
			    	preCld = new CalendarModel(SY-1, 11);
			    else
			    	preCld = new CalendarModel(SY, SM-1);
			    if(SM+1 > 11)
			    	nextCld = new CalendarModel(SY+1, 0);
			    else
			    	nextCld = new CalendarModel(SY, SM+1);
			    this.preCalendar = preCld;
			    this.nextCalendar = nextCld;
		    }
		    
		    // 显示农历干支、属相信息
		    var lunarTitle = '  农历' + LunarTools.cyclical(SY - 1900 + 36) + '年&nbsp;【' + Animals[(SY - 4) % 12] + '年】';
		    this.view.lunarPanel.html(lunarTitle);
		    // 显示当月日期视图（每个月最多不会跨7周，所以按6周算，这里i<42）
		    for (var i = 0; i < 42; i++) {
		    	// 公历日SD=SolarDay
		        sObj = this.view.gridDays.solars[i];
		        // 农历日/节日/节气 LD=LunarDay
		        lObj = this.view.gridDays.lunars[i];
		        
		        sObj.removeClass().addClass("calendar_solar_daynumber");
		        
		        /*
		         * firstWeek表示当月的1日是周几
		         * 默认周日为一周的第一天（这样好计算）
		         * sD=从当月1日到最后一日分别对应日期单元格的序号
		         */
		        var sD = i - cld.firstWeek;
		        // GD=日期单元格
		        var GD = this.view.gridDays.days[i];
				GD.removeClass();
				// 当月日期内
		        if (sD > -1 && sD < cld.length) {  
		            sObj.html(sD+1);
					// 国定假日颜色
					sObj.css("color", cld[sD].color);

		            if (cld[sD].lDay == 1){		//显示农历月，例如“闰3月大”
		                lObj.html('<b>' + (cld[sD].isLeap ? '闰' : '') + cld[sD].lMonth + '月' + (LunarTools.monthDays(cld[sD].lYear, cld[sD].lMonth) == 29 ? '小' : '大') + '</b>');
		            }else{  					//显示农历日
		                lObj.html(LunarTools.cDay(cld[sD].lDay));
		            }
		            // 农历日期显示的文本内容
		            var l_txt = cld[sD].lunarFestival;
		            var style_color = "black";
		            if (l_txt.length > 0) {  	//农历节日
		                style_color = "red";
		            } else {  					//公历节日
		            	l_txt = cld[sD].solarFestival;
		                if (l_txt.length > 0) {
		                    if(l_txt != '黑色星期五') style_color = "#0066FF";
		                } else {  			//廿四节气
		                	l_txt = cld[sD].solarTerms;
		                    if (l_txt.length > 0)  
		                    	style_color = "limegreen";
		                }
		            }

		            if(cld[sD].solarTerms != ""){
		            	style_color = "red";
		            	l_txt = cld[sD].solarTerms;
		            }
		            if (l_txt.length > 0) { 
		            	// 设置农历内容显示的span的宽度
		            	lObj.html(l_txt).css("color", style_color).attr("title", l_txt);
		            }

	            	// 日期单元格的平均宽度
	            	var gd_avg_width = (this.setting.cdrObj.width()-8)/7;
	            	lObj.css({"width":(gd_avg_width-2)+"px"});
		            
					// 标注“今日”的样式
					if(Today.tY==SY && Today.tM == SM && Today.tD == sD+1){
						GD.addClass("jinri");
					}
		        }else {  //非日期
		            GD.addClass("unover");
		            if(this.setting.isSuccessive){
		            	// 显示上一个月的月末日历
			            if(sD <= -1){
			            	var p_sD = preCld.length+sD;
			            	var dayNum = p_sD+1;
			            	sObj.html(dayNum);
							// 国定假日颜色
							sObj.css("color", preCld[p_sD].color);
				            if (preCld[p_sD].lDay == 1){		//显示农历月，例如“闰3月大”
				                lObj.html('<b>' + (preCld[p_sD].isLeap ? '闰' : '') + preCld[p_sD].lMonth + '月' + (LunarTools.monthDays(preCld[p_sD].lYear, preCld[p_sD].lMonth) == 29 ? '小' : '大') + '</b>');
				            }else{  					//显示农历日
				                lObj.html(LunarTools.cDay(preCld[p_sD].lDay));
				            }

				            var s = preCld[p_sD].lunarFestival;
				            var style_color = "black";
				            if (s.length > 0) {  	//农历节日
				                style_color = "red";
				            } else {  				//公历节日
				                s = preCld[p_sD].solarFestival;
				                if (s.length > 0) {
				                    if(s != '黑色星期五') style_color = "#0066FF";
				                } else {  			//廿四节气
				                    s = preCld[p_sD].solarTerms;
				                    if (s.length > 0)  
				                    	style_color = "limegreen";
				                }
				            }

				            if(preCld[p_sD].solarTerms == '清明'
				            	||preCld[p_sD].solarTerms == '芒种'
				            	||preCld[p_sD].solarTerms == '夏至'
				            	||preCld[p_sD].solarTerms == '冬至')	style_color = "red";
				            if (s.length > 0) { lObj.html(s).css("color", style_color).attr("title", s);}
				            
			            	// 日期单元格的平均宽度
			            	var gd_avg_width = (this.setting.cdrObj.width()-8)/7;
			            	lObj.css({"width":(gd_avg_width-2)+"px"});
			            }
			            // 显示下一个月的月初日历
			            else if(sD >= cld.length){
			            	var n_sD = sD - cld.length;
			            	var dayNum = n_sD + 1;
			            	sObj.html(dayNum);
							// 国定假日颜色
							sObj.css("color", nextCld[n_sD].color);
				            if (nextCld[n_sD].lDay == 1){		//显示农历月，例如“闰3月大”
				                lObj.html('<b>' + (nextCld[n_sD].isLeap ? '闰' : '') + nextCld[n_sD].lMonth + '月' + (LunarTools.monthDays(nextCld[n_sD].lYear, nextCld[n_sD].lMonth) == 29 ? '小' : '大') + '</b>');
				            }else{  					//显示农历日
				                lObj.html(LunarTools.cDay(nextCld[n_sD].lDay));
				            }

				            var s = nextCld[n_sD].lunarFestival;
				            var style_color = "black";
				            if (s.length > 0) {  	//农历节日
				                style_color = "red";
				            } else {  				//公历节日
				                s = nextCld[n_sD].solarFestival;
				                if (s.length > 0) {
				                    if(s != '黑色星期五') style_color = "#0066FF";
				                } else {  			//廿四节气
				                    s = nextCld[n_sD].solarTerms;
				                    if (s.length > 0)  
				                    	style_color = "limegreen";
				                }
				            }

				            if(nextCld[n_sD].solarTerms == '清明'
				            	||nextCld[n_sD].solarTerms == '芒种'
				            	||nextCld[n_sD].solarTerms == '夏至'
				            	||nextCld[n_sD].solarTerms == '冬至')	style_color = "red";
				            if (s.length > 0) { lObj.html(s).css("color", style_color).attr("title", s);}

			            	// 日期单元格的平均宽度
			            	var gd_avg_width = (this.setting.cdrObj.width()-8)/7;
			            	lObj.css({"width":(gd_avg_width-2)+"px"});
			            }
		            }// if(isSuccessive) end
		        }
		    }
		    // 注册事件
		    _bindEvent(this.setting);
		}
		/*
		 * 刷新指定月份的特殊工作日和节假日数据到页面
		 * 默认请求当年的所有记录
		 */
		,refreshWorkDayMonth: function(url, sY, sM){
			if(!/\d{4}/.test(sY) || !(/1?\d/.test(sM) && sM>=0 && sM<=11)){
				return;
			}
			var that = this;
			this.remoteWorkDay(url, sY, function(rows){
				// 将工作日数据rows同步到cdr对象
				cdr.workDays = rows;
				// 渲染
				if(rows && rows.length>0){
					var m = sM<10?'0'+sM:sM;
					var regexp = new RegExp("^"+sY+m);
					$.each(rows, function(i,v){
						if(regexp.test(v)){
							if (v.isWorkDay == "1"){  		//特殊工作日
								that.setWorkDay(v, cdr.WoWorkDayType.WORKDAY);
		                	}else if(ob.isWorkDay == "0"){ 	//假日
		                		that.setWorkDay(v, cdr.WoWorkDayType.HOLIDAY);
							}
							
						}
					});
				}
			});
			
		}
		/*
		 * 请求服务器地址，获取特殊上班日和休息日；默认异步请求
		 * 返回json数据格式[{ymd:'yyyyMMdd',isWorkDay:'1是上班日0是休息日'}]
		 * url:	
		 * sY: 4位年份
		 * sM: 月份[0-11],null:查询当年的所有记录
		 * callbackFun: 回调函数
		 */
		,remoteWorkDay: function(url, sY, sM, callbackFun){
			if(!/\d{4}/.test(sY) || !(sM==null || /1?\d/.test(sM) && sM>=0 && sM<=11)){
				console.error("参数年份或月份不正确！");
				return null;
			}
			var param = {"year": sY};
			if(null!=sM && /1?\d/.test(sM) && sM>=0 && sM<=11)
				param["month"] = sM+1;
			$.ajax({
		        url: url,
		        type: 'post',
		        data: param,
		        cache: false,
		        dataType: 'json',
		        success: function(dt) {
		            if (dt.isError === "1") {
		            	console.error("请求远程服务失败！");
		            } else {
		            	if(typeof(callbackFun) == "function")
		            		callbackFun(dt.data);
		            	return dt.data;
		            }
		        },
		    })
		}
		/*
    	 *  设置工作日、休息日、请假日、调休日...
    	 *  $day : 日期单元格td的jquery对象或公历年月日字符串(yyyyMMdd)
    	 *  dayType: 需要设置的工作日类型（上班，休息，请假，调休，加班...）
    	 */
    	,setWorkDay: function($day, dayType){
    		if($day instanceof jQuery){
        		switch(dayType){
        		case this.WorkDayType.HOLIDAY:	// 休息日
        			if($day.find('div[class*="holiday"]').length<=0){
    	    			var holiday_div = $('<div class="holiday"></div>');
    	    			$day.prepend(holiday_div);
        			}
        			break;
        		case this.WorkDayType.WORKDAY:	// 工作日
        			if($day.find('div[class*="workday"]').length<=0){
    	    			var workday_div = $('<div class="workday"></div>');
    	    			$day.prepend(workday_div);
        			}
        			break;
        		case this.WorkDayType.OFFWORK:	// 请假
        			if($day.find('div[class*="offwork"]').length<=0){
    	    			var offwork_div = $('<div class="offwork"></div>');
    	    			$day.prepend(offwork_div);
        			}
        			break;
        		case this.WorkDayType.TAKEOFF:	// 调休
        			if($day.find('div[class*="takeoff"]').length<=0){
    	    			var takeoff_div = $('<div class="takeoff"></div>');
    	    			$day.prepend(takeoff_div);
        			}
        			break;
        		case this.WorkDayType.OVERTIME:	// 加班
        			if($day.find('div[class*="overtime"]').length<=0){
    	    			var overtime_div = $('<div class="overtime"></div>');
    	    			$day.prepend(overtime_div);
        			}
        			break;
        		case this.WorkDayType.BUSINESSTRIP:	// 出差
        			if($day.find('div[class*="businesstrip"]').length<=0){
    	    			var businesstrip_div = $('<div class="businesstrip"></div>');
    	    			$day.prepend(businesstrip_div);
        			}
        			break;
        		}
    		}else if(typeof($day)=="string"){
    			if($day.match(/^(\d{4})(\d{2})(\d{2})$/)){
    				var $_day = this.view.getGridDay(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3), this.CalendarType.SOLAR);
    				this.setWorkDay($_day, dayType);
    			}
    		}
    	}
	};
	/**
	 * 农历计算工具类
	 */
	var LunarTools = {
		/*
		 * 农历日数值  转成  农历日中文日期名称<br/>
		 * d:	农历“日”数值<br/>
		 * m:	农历“月”数值(1-12)<br/>
		 * dt:	是否显示“初一”（默认显示农历月份名称）
		 */
		cDay: function(d, m, dt){
			var s;
			switch (d) {
			case 1:
				s = monthName[m - 1];
				if(dt){
				s = '初一';
				}
				break;
			case 10:
				s = '初十';
				break;
			case 20:
				s = '二十';
				break;
			case 30:
				s = '三十';
				break;
			default:
				s = nStr2[Math.floor(d / 10)];
				s += nStr1[d % 10];
			}
			return (s);
		}
		/*
		 * 返回农历 y年的总天数
		 */
		,lYearDays: function(y){
			var i,
			sum = 348;	// 29天*12个月
			// 从y年的1月份循环到12月份，月大就增加1天
			for (i = 0x8000; i > 0x8; i >>= 1)
				sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
			return (sum + this.leapDays(y));
		}
		/*
		 * <p>
		 * 返回农历 y年闰月的天数
		 * </p>
		 * 运算：
		 * 将y年对应的lunar模板数组第一项与0x10000运算，1：闰大月（30天），0：闰小月（29天）
		 * 0x10000的二进制是0001 0000 0000 0000 0000
		 */
		,leapDays: function(y) {
			if (this.leapMonth(y))
				return ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
			else
				return 0;
		}
		/*
		 * <p>
		 * 返回农历 y年闰哪个月<br/>
		 * 有：返回1-12<br/>
		 * 无：返回0
		 * </p>
		 * 运算：
		 * 将y年对应的lunar模板数组的第5项与0xf运算，返回闰的月份
		 * 0xf的二进制是0000 0000 0000 0000 1111
		 */
		,leapMonth: function(y) {
		    return(lunarInfo[y - 1900] & 0xf);
		}
		/*
		 * <p>
		 * 返回农历 y年m月的总天数<br/>
		 * 农历年月大30天，月小29天
		 * </p>
		 * 运算：
		 * 将y年对应的lunar模板数组的第二项或第三项或第四项与（0x10000>>m）运算，返回1表示月大，反则是月小
		 * 【若位运算>>,&,|,^不明白,赶紧去恶补】
		 */
		,monthDays: function(y, m) {
			return ((lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
		}
		/*
		 * 返回干支<br/>
		 * 60进制表示法（60年一轮回），0-59表示甲子，甲丑...癸亥<br/>
		 * 参数num: 相对于1900年的年份差值，但需要补上36
		 * <p>
		 * Ex: 2018年（戊戌年），1900的干支值是36	<br/>
		 * (2018-1900+36)%10 = 4	（戊）<br/>
		 * (2018-1900+36)%12 = 10	（戌）
		 * </p>
		 */
		,cyclical: function(num){
			return (Gan[num % 10] + Zhi[num % 12]);
		}
		/*
		 * 算出农历, 传入日期对象（Date）, 返回农历日期对象
		 * 该控件属性有<br/>
		 * year		农历年份<br/>
		 * month	农历月份[1-12]<br/>
		 * day		农历几号<br/>
		 * isLeap	是否是闰月
		 * <p>
		 * Ex: 2018年10月31日，农历2018年9月23号<br/>
		 * new Lunar(new Date()).month 返回9
		 * </p>
		 */
		,Lunar: function(objDate) {
			var i,
			leap = 0,	// objDate的农历年闰月的月份
			temp = 0;	// objDate对应年的农历年天数
			// offset存储objDate与农历1900年初一的正向偏移天数
			var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;
			// lunarInfo有限，1900<i<2050，且仅支持1900往后的农历
			for (i = global.minYear; i < global.maxYear && offset > 0; i++) {
				temp = LunarTools.lYearDays(i);
				offset -= temp;
			}
			// 修正offset,i
			if (offset < 0) {
				offset += temp;
				i--;
			}
			this.year = i;
			leap = LunarTools.leapMonth(i); //闰哪个月
			this.isLeap = false;
			
			for (i = 1; i < 13 && offset > 0; i++) {
				//闰月
				if (leap > 0 && i == (leap + 1) && this.isLeap == false) {
					--i;
					this.isLeap = true;
					temp = LunarTools.leapDays(this.year);
				} else {
					temp = LunarTools.monthDays(this.year, i);
				}
				//解除闰月
				if (this.isLeap == true && i == (leap + 1))
					this.isLeap = false;
				
				offset -= temp;
			}
			if (offset == 0 && leap > 0 && i == leap + 1){
				if (this.isLeap) {
					this.isLeap = false;
				} else {
					this.isLeap = true;
					--i;
				}
			}
			if (offset < 0) {
				offset += temp;
				--i;
			}
			this.month = i;
			this.day = offset + 1;
		}
	};
	/**
	 * 面板工具
	 */
	var View = {
		selectYPanel: null	// 年份选择面板
		,selectMPanel: null	// 月份选择面板
		,sY: null			// 年份显示span
		,sM: null			// 月份显示span
		,preYear: null
		,lunarPanel: null	// 农历年柱，属相
		// gridDays存储该月份每个日期单元格对象，公历页面元素对象，农历页面元素对象
		,gridDays: {
			days:[]
			,solars:[]
			,lunars:[]
		}
		,ini: function(obj){
			this.selectYPanel = this.select_Y_panel();
			this.selectMPanel = this.select_M_panel();
			var tr1 = $("<tr></tr>");
			var td1_1 = $('<td class="calTit" colSpan=7 style="height:30px;padding-top:3px;text-align:center;"></td>');
			var view_panel = $('<div style="text-align:center;display:inline-block;"></div>')
					.append(this.btn_preY()).append(this.btn_preM())
					.append(this.ini_YM_panel())
					.append(this.btn_nextY()).append(this.btn_nextM());
			td1_1.append(view_panel).append(this.selectYPanel).append(this.selectMPanel);
			tr1.append(td1_1);
			// 添加页头两行数据到table
			obj.append(tr1).append(this.ini_week());
			var that = this;
			var panel_ele = {
				yearPanel: this.sY
				,monthPanel: this.sM
				,lunarPanel: this.lunarPanel
				,gridDays: this.gridDays
				,getGridDay: function(sy,sm,sd,calendarType){
					return that.getGridDay(sy,sm,sd,calendarType);
				}
			}
			return panel_ele;
		}
		,ini_week: function(){
			var tr2 = $('<tr class="calWeekTit" style="font-size:12px; height:20px;text-align:center;"></tr>');
			var td2 = [];
			td2.push('<td class="td_weekend">星期日</td>');
			td2.push('<td class="td_week">星期一</td>');
			td2.push('<td class="td_week">星期二</td>');
			td2.push('<td class="td_week">星期三</td>');
			td2.push('<td class="td_week">星期四</td>');
			td2.push('<td class="td_week">星期五</td>');
			td2.push('<td class="td_weekend">星期六</td>');
			tr2.append(td2.join(''));
			return tr2;
		}
		,ini_YM_panel: function(){
			this.sY = this.s_Y();
			this.sM = this.s_M();
			this.lunarPanel = this.lunar_panel();
			var YM_panel = $('<div style="margin:0 auto;display:inline-block;"></div>');
			// “今天”按钮
			var goToday = $('<span class="today">今天</span>');
			goToday.click(function(){
				if(global.currYear!=Today.tY || global.currMonth!=Today.tM){
					cdr.drawCld(Today.tY, Today.tM);
					// 触发事件
					if(cdr.setting && cdr.setting.callback){
						if(typeof cdr.setting.callback.dateChange=='function'){
							tools.apply(cdr.setting.callback.dateChange, [global.currYear ,global.currMonth]);
						}
					}
				}
	    		
			});
			YM_panel.append(this.sY).append(this.s_Y_title)
				.append(this.sM).append(this.s_M_title)
				.append(this.lunarPanel).append(goToday);
			return YM_panel;
		}
		,btn_preY: function(){
			var a1 = $('<a href="javascript:;;" title="上一年" class="ymNaviBtn lsArrow"></a>')
					.click(function(){
						global.currYear--;
						if(global.currYear < global.minYear)	global.currYear=global.minYear;
						cdr.drawCld(global.currYear, global.currMonth);
						// 触发事件
						if(cdr.setting && cdr.setting.callback){
							if(typeof cdr.setting.callback.dateChange=='function'){
								tools.apply(cdr.setting.callback.dateChange, [global.currYear ,global.currMonth]);
							}
						}
					});
			this.preYear = a1;
			return a1;
		}
		,btn_preM: function(){
			var a2 = $('<a href="javascript:void(0);" title="上一月" class="ymNaviBtn lArrow"></a>')
				.click(function(){
					global.currMonth--;
					if(global.currMonth<0){
						global.currMonth = 11;
						global.currYear--;
						if(global.currYear < global.minYear) global.currYear = global.minYear;
					}
					cdr.drawCld(global.currYear, global.currMonth);
					// 触发事件
					if(cdr.setting && cdr.setting.callback){
						if(typeof cdr.setting.callback.dateChange=='function'){
							tools.apply(cdr.setting.callback.dateChange, [global.currYear ,global.currMonth]);
						}
					}
				});
			return a2;
		}
		,s_Y: function(){
			var that = this;
			/*
			 *  显示年份的span
			 *  点击事件，弹出年份下拉选项
			 */
			var sy = $('<span class="topDateFont"></span>')
				.mouseover(function(){
					$(this).css("cursor","pointer");
				})
				.click(function(event){
					that.selectYPanel.css({"left":event.pageX-80,"z-index":1000}).show().focus();
					var curLi = that.selectYPanel.find("li[y="+global.currYear+"]").addClass('sel_year_hover');
					var st = curLi.offset().top + that.selectYPanel.scrollTop()-that.selectYPanel.offset().top-60;
					// 年份列表滚动到当前年份位置
					that.selectYPanel.scrollTop(st);
					// 修正年份下拉框位置
					var year_left = that.selectYPanel.offset().left;
					if(year_left<=0){
						that.selectYPanel.offset({left: year_left+that.selectYPanel.width()});
					}
					// 关闭月份选择面板
					that.selectMPanel.hide();
				});
			return sy;
		}
		,s_Y_title: $('<span class="topDateFont">年</span>')
		,s_M: function(){
			var that = this;
			// 显示月份的span
			var sm = $('<span id="yue" class="topDateFont"></span>')
				.mouseover(function(){$(this).css("cursor","pointer");})
				.click(function(event){
					that.selectMPanel.css({"left":event.pageX-20,"z-index":1000}).show().focus();
					that.selectMPanel.find('li[m='+global.currMonth+']').addClass('sel_month_hover');
					// 关闭年份选择面板
					that.selectYPanel.hide();
				});
			
			return sm;
		}
		,s_M_title: $('<span class="topDateFont">月</span>')
		,lunar_panel: function(){
			var lunar_title = $('<span class="topDateFont"></span>');
			return lunar_title;
		}
		,btn_nextY: function(){
			var a3 = $('<a href="javascript:void(0);" title="下一年" class="ymNaviBtn rsArrow" ></a>')
					.click(function(){
						global.currYear++;
						if(global.currYear > global.maxYear)	global.currYear = global.maxYear;
						cdr.drawCld(global.currYear, global.currMonth);
						// 触发事件
						if(cdr.setting && cdr.setting.callback){
							if(typeof cdr.setting.callback.dateChange=='function'){
								tools.apply(cdr.setting.callback.dateChange, [global.currYear ,global.currMonth]);
							}
						}
					});
			return a3;
		}
		,btn_nextM: function(){
			var a4 = $('<a href="javascript:void(0);" title="下一月" class="ymNaviBtn rArrow" ></a>')
					.click(function(){
						global.currMonth++;
						if(global.currMonth > 11){
							global.currMonth=0;
							global.currYear++;
							if(global.currYear > global.maxYear)	global.currYear = global.maxYear;
						}
						cdr.drawCld(global.currYear, global.currMonth);
						// 触发事件
						if(cdr.setting && cdr.setting.callback){
							if(typeof cdr.setting.callback.dateChange=='function'){
								tools.apply(cdr.setting.callback.dateChange, [global.currYear ,global.currMonth]);
							}
						}
					});
			return a4;
		}
		,select_Y_panel: function(){
			var that = this;
			var sel_panel = $('<div class="sel_Y_date" ></div>');
			var ul = $('<ul></ul>');
			for(var i=global.minYear; i<2051; i++){
				var li = $('<li y='+i+'>'+i+'</li>');
				li.click(function(){
					var y = parseInt($(this).attr("y"));
					if(global.currYear != y){
						global.currYear = y;
						// 1. 刷新日历面板
						cdr.drawCld(y, global.currMonth);
						// 触发事件
						if(cdr.setting && cdr.setting.callback){
							if(typeof cdr.setting.callback.dateChange=='function'){
								tools.apply(cdr.setting.callback.dateChange, [global.currYear ,global.currMonth]);
							}
						}
					}
					// 2. 关闭年份选择面板，并移除li样式
					that.selectYPanel.hide().find('li').removeClass("sel_year_hover");
				});
				ul.append(li);
			}
			sel_panel.append(ul);//.blur(function(){$(this).hide();});
			$(document).off('click.sel-Y-date').on('click.sel-Y-date', function( event ){
				// 找出年份所在的span是同辈元素的第几个，如果$(event.target)不是第一个就隐藏年份选择面板
				var index = $(event.target).parent().find("span").index($(event.target));
                if(0!=index) {
                    $('.sel_Y_date').hide();
                }
            });
			return sel_panel;
		}
		,select_M_panel: function(){
			var that = this;
			var sel_panel = $('<div class="sel_M_date" ></div>');
			var ul = $('<ul></ul>');
			for(var i=0; i<12; i++){
				var li = $('<li m='+i+'>'+(i+1)+'</li>');
				li.click(function(){
					var m = parseInt($(this).attr("m"));
					if(global.currMonth != m){
						global.currMonth = m;
						// 1. 刷新日历面板
						cdr.drawCld(global.currYear, m);
						// 触发事件
						if(cdr.setting && cdr.setting.callback){
							if(typeof cdr.setting.callback.dateChange=='function'){
								tools.apply(cdr.setting.callback.dateChange, [global.currYear, m]);
							}
						}
					}
					// 2. 关闭月份选择面板，并移除li样式
					that.selectMPanel.hide().find('li').removeClass("sel_month_hover");
				});
				ul.append(li);
			}
			sel_panel.append(ul);
			$(document).off('click.sel-M-date').on('click.sel-M-date', function( event ){
				var index = $(event.target).parent().find("span").index($(event.target));
                if(2!=index) {
                    $('.sel_M_date').hide();
                }
            });
			return sel_panel;
		}
		// 初始化星期日-星期六的6周网格对象
		,iniGrid: function(obj){
			var gNum;
			var days_grid=[];
			var sl_grid=[];
		    for (var i = 0; i < 6; i++) {
		    	var tr = $('<tr style="table-layout:fixed" align=center ></tr>');
		        for (var j = 0; j < 7; j++) {
		        	gNum = i * 7 + j ;
		        	var td = $('<td on="0" ></td>');
		        	var sd = $('<span class="calendar_solar_daynumber" > </span>');
		        	// 周六，周日默认红色
		        	if(j == 0 || j == 6) sd.css("color", "red");
		        	var ld = $('<span class="calendar_lunar_day"> </span>');
		        	td.append(sd).append('<br/>').append(ld);
		        	tr.append(td);
		        	
		        	days_grid.push(td);
		        	this.gridDays.solars.push(sd);
		        	this.gridDays.lunars.push(ld);
		        }
		        obj.append(tr);
		    }
		    this.gridDays.days = days_grid;
		    return days_grid;
		}
		// 获取GD对象 by sy,sm,sd公历年，月[1-12]，日
		,getGridDay: function(sy,sm,sd,calendarType){
			if(sy==undefined || sy==null){
				sy = global.currYear;
			}
			for(var i=0; i<cdr.calendar.length; i++){
				var dayElement = cdr.calendar[i];
				if(calendarType==cdr.CalendarType.SOLAR){
					if(sy==dayElement.sYear && sm==dayElement.sMonth && sd==dayElement.sDay){
						return dayElement.getGridDay();
					}
				}else if(calendarType==cdr.CalendarType.LUNAR){
					if(sy==dayElement.lYear && sm==dayElement.lMonth && sd==dayElement.lDay){
						return dayElement.getGridDay();
					}
				}
			}
			return null;
		}
	};
	
	/**
	 * 具体某一月份的日历数据模型（公历，农历，节假日，节气，年柱，月柱，日柱信息）<br/>
	 * y: 年份，m: 月份数字[0-11] <br/>
	 * {
	 * length: 当月总天数<br/>
	 * firstWeek：1日是周几[0-6]<br/>
	 * DayElement[]:	当月所有日期的DayElement对象数组<br/>
	 * }
	 */
	function CalendarModel(y, m) {
		var sDObj,
		lDObj,
		lY,
		lM,
		lD = 1,
		lL,
		lX = 0,
		tmp1,
		tmp2,
		tmp3;
		//年柱,月柱,日柱
		var cY, cM, cD; 
		/*
		 * 记录当月公历月份日期中农历出现的第一日(即公历1日对应的农历是几号)和农历跨月份的偏移天数
		 * 一个公历月份中存在跨两或三个农历月份（公历一个月最多天数是31天，农历一个月最少天数是29天，所以这里lDPOS长度是3）
		 */ 
		var lDPOS = new Array(3);
		var n = 0;
		var firstLM = 0;	// 当前公历月份中农历的第一个月份数值
		
		sDObj = new Date(y, m, 1, 0, 0, 0, 0); 	//当月1日日期
		this.length = solarDays(y, m); 			//公历当月天数
		this.firstWeek = sDObj.getDay(); 		//公历当月1日星期几，返回[0-6]

		/*
		 * 年柱
		 * 1900年立春后为庚子年(庚子用60进制表示为36，也就是说1900年农历的干支年表示为36)
		 * 立春在3月份之前
		 */
		if (m < 2)
			cY = LunarTools.cyclical(y - 1900 + 36 - 1);
		else
			cY = LunarTools.cyclical(y - 1900 + 36);
		
		var term2 = sTerm(y, 2); //立春日期，公历y年的第三个节气是立春
		
		/* 月柱
		 * 1900年1月小寒以前为 丙子月(丙子用60进制表示为12)
		 */
		cM = LunarTools.cyclical((y - 1900) * 12 + m + 12);
	   
	    /* 日柱
	     * 当月一日与 1900/1/1 相差天数
	     * 1900/1/1与 1970/1/1 相差25567日, 1900/1/1 日柱为甲戌日(60进制10)
	     */
	    var dayCyclical = Date.UTC(y, m, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;

	    for (var i = 0; i < this.length; i++) {
	        if (lD > lX) {
	            sDObj = new Date(y, m, i + 1);		//当月1日日期
	            lDObj = new LunarTools.Lunar(sDObj);//农历日期对象
	            lY = lDObj.year;           			//农历年
	            lM = lDObj.month;          			//农历月[1-12]
	            lD = lDObj.day;            			//农历日
	            lL = lDObj.isLeap;         			//农历是否闰月
	            lX = lL ? LunarTools.leapDays(lY) : LunarTools.monthDays(lY, lM); //农历当月总天数

	            if (n == 0) 
	            	firstLM = lM;
	            lDPOS[n++] = i - lD + 1;
	        }
	        //依节气调整二月份的年柱, 以立春为界
	        if (m == 1 && ((i + 1) == term2 || lD == 1))
				cY = LunarTools.cyclical(y - 1900 + 36);
	        if (lD == 1) {
				cM = LunarTools.cyclical((y - 1900) * 12 + m + 13);
			}
	        //日柱
	        cD = LunarTools.cyclical(dayCyclical + i);
	        lD2 = (dayCyclical + i);
	        this[i] = new DayElement(
	        		y, m + 1, i + 1
	        		,nStr1[(i + this.firstWeek) % 7]
	        		,lY ,lM ,lD++ ,lL
	        		,cY, cM, cD
	        		,i);
	    }

	    //节气，一个月最多有2个节气（每15天一个节气）
	    tmp1 = sTerm(y, m * 2) - 1;
	    tmp2 = sTerm(y, m * 2 + 1) - 1;
	    this[tmp1].solarTerms = solarTerm[m * 2];
	    this[tmp2].solarTerms = solarTerm[m * 2 + 1];
	    if (m == 3) 
	    	this[tmp1].color = 'red'; //清明颜色

	    //公历节日
	    var s_ftv = cdr.setting.festival.solarFestival;
		for (i in s_ftv)
			if (s_ftv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/)){
				if (Number(RegExp.$1) == (m + 1)) {
					this[Number(RegExp.$2) - 1].solarFestival += RegExp.$4 + ' ';
					if (RegExp.$3 == '*')
						this[Number(RegExp.$2) - 1].color = 'red';
				}
			}

		//月周节日
		var w_ftv = cdr.setting.festival.weekFestival;
		for (i in w_ftv)
			if (w_ftv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/)){
				if (Number(RegExp.$1) == (m + 1)) {
					tmp1 = Number(RegExp.$2);	// 第几个或倒数第几个
					tmp2 = Number(RegExp.$3);	// 星期几[0-6]
					if (tmp1 < 5)	// 顺数
						this[((this.firstWeek > tmp2) ? 7 : 0) + 7 * (tmp1 - 1) + tmp2 - this.firstWeek].solarFestival += RegExp.$5 + ' ';
					else {			// 倒数
						tmp1 -= 5;
						tmp3 = (this.firstWeek + this.length - 1) % 7; //当月最后一天星期?
						this[this.length - tmp3 - 7 * tmp1 + tmp2 - (tmp2 > tmp3 ? 7 : 0) - 1].solarFestival += RegExp.$5 + ' ';
					}
				}
			}
		//农历节日
		var l_ftv = cdr.setting.festival.lunarFestival;
		for (i in l_ftv)
			if (l_ftv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
				tmp1 = Number(RegExp.$1) - firstLM;
				if (tmp1 == -11)
					tmp1 = 1;
				if (tmp1 >= 0 && tmp1 < n) {
					// tmp2是对应当月公历日期数据模型中的索引
					tmp2 = lDPOS[tmp1] + Number(RegExp.$2) - 1;
					// 在当月日期范围内且不是农历闰月
					if (tmp2 >= 0 && tmp2 < this.length && this[tmp2].isLeap != true) {
						this[tmp2].lunarFestival += RegExp.$4 + ' ';
						if (RegExp.$3 == '*')
							this[tmp2].color = 'red';
					}
				}
			}
		//复活节只出现在3或4月
		if (m == 2 || m == 3) {
			var estDay = new easter(y);
			if (m == estDay.m)
				this[estDay.d - 1].solarFestival = this[estDay.d - 1].solarFestival + ' 复活节';
		}

		//黑色星期五
		if ((this.firstWeek + 12) % 7 == 5)
			this[12].solarFestival += '黑色星期五';
		
		//今日
		if (y == Today.tY && m == Today.tM)
			this[Today.tD - 1].isToday = true;
	};
	/*
	 * 返回该年的复活节(春分月圆之后第一个星期日)
	 */
	function easter(y) {
		var term2 = sTerm(y, 5); //取得春分日期的“日”
		var dayTerm2 = new Date(Date.UTC(y, 2, term2, 0, 0, 0, 0)); //取得春分的公历日期控件(春分一定出现在3月)
		var lDayTerm2 = new LunarTools.Lunar(dayTerm2); //取得春分农历
		var lMlen;	//计算到下个月圆的相差天数
		if (lDayTerm2.day < 15) 
			lMlen = 15 - lDayTerm2.day;
		else
			lMlen = (lDayTerm2.isLeap ? LunarTools.leapDays(y) : LunarTools.monthDays(y, lDayTerm2.month)) - lDayTerm2.day + 15;
		
		//一天等于 1000*60*60*24 = 86400000 毫秒
		var l15 = new Date(dayTerm2.getTime() + 86400000 * lMlen); //求出第一次月圆为公历几日
		var dayEaster = new Date(l15.getTime() + 86400000 * (7 - l15.getUTCDay())); //求出下个周日
		
		this.m = dayEaster.getUTCMonth();
		this.d = dayEaster.getUTCDate();

	};
	// 一位数字补上前缀'0'
	function addZ(obj){
		 return obj<10?'0'+obj:obj;
	};
	/*
	 * 判断日期dateStr字符串是否是周末（周六或周日）
	 */
	function getH(dateStr){
		 var d = new Date(Date.parse(dateStr));
		 var c = d.getDay();
		 if(c==0||c==6){
		 	return true;
		 }else{
		 	return false;	
		 }
	};
	/**
	 * 具体某天的基本日历属性（公历年、月[1-12]、日，星期，农历年、月[1-12]、日、闰、年柱、月柱、日柱，公历节日，农历节日、节气）
	 */
	var DayElement = function(sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap, cYear, cMonth, cDay, i) {
		this.isToday = false;
		//公历
		this.sYear = sYear; 	//公元年4位数字
		this.sMonth = sMonth; 	//公元月数字
		this.sDay = sDay; 		//公元日数字
		this.week = week; 		//星期, 1个中文
		//农历
		this.lYear = lYear; 	//公元年4位数字
		this.lMonth = lMonth; 	//农历月数字
		this.lDay = lDay; 		//农历日数字
		this.isLeap = isLeap; 	//是否为农历闰月?
		//八字
		this.cYear = cYear; 	//年柱, 2个中文
		this.cMonth = cMonth; 	//月柱, 2个中文
		this.cDay = cDay; 		//日柱, 2个中文
		
		this.color = '';
		
		this.lunarFestival = '';	//农历节日
		this.solarFestival = '';	//公历节日
		this.solarTerms = '';		//节气
		
		this.index = i;
	};
	/*
	 * 添加方法
	 */ 
	// 设置上班，休息，请假，调休，加班...
	DayElement.prototype.setWorkDay = function(dayType){
		var $day = this.getGridDay();
		cdr.setWorkDay($day, dayType);
	};
	// 获取GD对象by 年、月、日（公历）
	DayElement.prototype.getGridDay = function(){
		// 折算index在gridDays.days中的索引sD
		var sD = this.index + cdr.calendar.firstWeek;
		// 获取当前日期所在的td元素对象$day
		var $day = cdr.view.gridDays.days[sD];
		return $day;
	}

	/**
	 * y年的第n个节气为几日(公历，从0小寒起算)	<br/>
	 * 【1900-01-06 02:05:00】 小寒，1900年第一个节气，设置此时间为换算节气日的基准时间
	 * 【31556925974.7】		一个节气周年（从小寒到第二年小寒）的毫秒数，约365.24219天
	 * 
	 * |__|___________|_|
	 * |1900/1/1 00:00:00
	 *    |1900年小寒
	 *    			  |y年/1/1 00:00:00
	 *    				|y年第n个节气
	 */
	function sTerm(y, n) {
		if (y == 2009 && n == 2) {
			sTermInfo[n] = 43467
		}
		var offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
		return (offDate.getUTCDate());
	}

	/**
	 * 返回公历 y年某m+1月的天数，m取值[0-11]
	 */
	function solarDays(y, m) {
		if (m == 1)
			return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
		else
			return (solarMonth[m]);
	}
	/*清除日历月视图网格数据*/
	function clear() {
		// 清理日期单元格td里面的公历和农历span
    	cdr.view.gridDays.solars = [];
    	cdr.view.gridDays.lunars = [];
	    for (i = 0; i < 42; i++) {
	    	// 日期单元格td
	        var GD = cdr.view.gridDays.days[i];
	        if(GD){
	        	GD.removeClass("unover jinri selday").html('');
	        	
	        	var sd = $('<span class="calendar_solar_daynumber" > </span>');
	        	// 周六，周日默认红色
	        	if(i%7==0 || i%7==6) sd.css("color", "red");
	        	var ld = $('<span class="calendar_lunar_day"> </span>');
	        	GD.append(sd).append('<br/>').append(ld);
	        	
	        	cdr.view.gridDays.solars.push(sd);
	        	cdr.view.gridDays.lunars.push(ld);
	        }
	    }
	}
	// 当前日历显示的日期 or 将要显示的日期
	var global = {
		currYear : -1, 		// 当前年
		currMonth : -1, 	// 当前月，0-11
		currDate : null 	// 当前点选的日期
		,minYear: 1900
		,maxYear: 2050
	};
	
	var cdr = $.fn.Calendar;
	
})(jQuery);