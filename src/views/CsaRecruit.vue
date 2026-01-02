<script setup>
import { ref, reactive, inject,onMounted } from 'vue';
import draggable from 'vuedraggable';

const axios = inject('axios')

const isLoading = ref(true);
const isRecruiting = ref(false); // 
const recruitDeadline = ref(''); //

const form = reactive({
  name: '',
  render: true,
  uid: '',
  major_id: null,
  major_name: '',
  college_id: null,
  college_name: '',
  degree: null, 
  grade: null, 
  phone: '',
  office_department_willing: 0,
  competition_department_willing: 0,
  research_department_willing: 0,
  activity_department_willing: 0,
  if_agree_to_be_reassigned: false,
  if_be_member: false,
  introduction: '',
  skill: '',
  interview_time_slots: [], // 面试时间段选择
});

// Validation errors
const validationErrors = reactive({
  name: '',
  uid: '',
  phone: ''
});

// Track if fields have been touched
const fieldTouched = reactive({
  name: false,
  uid: false,
  phone: false
});

// Resume upload state
const resumeFile = ref(null);
const resumeUploadStatus = ref('');
const resumeUploadLoading = ref(false);

// 提交成功状态
const submitSuccess = ref(false);
const countdown = ref(5);

// Validation functions
const validateName = (name) => {
  if (!name) {
    validationErrors.name = '姓名不能为空';
    return false;
  }
  if (name.length > 12) {
    validationErrors.name = '姓名长度不能超过12个字符';
    return false;
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(name)) {
    validationErrors.name = '姓名只能包含中文、英文字母和空格';
    return false;
  }
  validationErrors.name = '';
  return true;
};

const validateUid = (uid) => {
  if (!uid) {
    validationErrors.uid = '学号不能为空';
    return false;
  }
  if (!/^\d{1,10}$/.test(uid)) {
    validationErrors.uid = '学号只能包含1-10位数字';
    return false;
  }
  validationErrors.uid = '';
  return true;
};

const validatePhone = (phone) => {
  if (!phone) {
    validationErrors.phone = '手机号不能为空';
    return false;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    validationErrors.phone = '请输入正确的11位手机号码';
    return false;
  }
  validationErrors.phone = '';
  return true;
};

let nameValidationTimeout = null;
let uidValidationTimeout = null;
let phoneValidationTimeout = null;

const debouncedValidateName = (name) => {
  fieldTouched.name = true;
  clearTimeout(nameValidationTimeout);
  nameValidationTimeout = setTimeout(() => {
    validateName(name);
  }, 300);
};

const debouncedValidateUid = (uid) => {
  fieldTouched.uid = true;
  clearTimeout(uidValidationTimeout);
  uidValidationTimeout = setTimeout(() => {
    validateUid(uid);
  }, 300);
};

const debouncedValidatePhone = (phone) => {
  fieldTouched.phone = true;
  clearTimeout(phoneValidationTimeout);
  phoneValidationTimeout = setTimeout(() => {
    validatePhone(phone);
  }, 300);
};

// 验证面试时间段选择
const validateTimeSlots = () => {
  if (form.interview_time_slots.length === 0) {
    window.notyf.error('请至少选择一个面试时间段');
    return false;
  }
  if (form.interview_time_slots.length < 4) {
    window.notyf.error('请至少选择四个面试时间段');
    return false;
  }
  return true;
};

// Real-time validation
const validateForm = () => {
  const nameValid = validateName(form.name);
  const uidValid = validateUid(form.uid);
  const phoneValid = validatePhone(form.phone);
  const timeSlotsValid = validateTimeSlots();
  
  if (form.degree === '学士' || (typeof form.degree === 'number' && form.degree === 0)) {
    if (!form.major_id || !form.college_id || !form.college_name) {
      window.notyf.error('请从专业列表中选择您的专业');
      return false;
    }
  }
  
  return nameValid && uidValid && phoneValid && timeSlotsValid;
};

const departmentList = ref([
  { id: 'office_department_willing', name: '办公室部' },
  { id: 'competition_department_willing', name: '竞赛部' },
  { id: 'research_department_willing', name: '科研部' },
  { id: 'activity_department_willing', name: '活动部' },
]);

const majorSearchResults = ref([]);

// 面试时间段相关
const interviewTimeSlots = ref([]);

// 生成面试时间段选项
const generateTimeSlots = () => {
  const slots = [];
  
  // 工作日时间段（周一到周五分别显示）
  const weekdays = ['周一', '周二', '周三', '周四', '周五'];
  const weekdayTimes = ['19:00-20:00', '20:00-21:00', '21:00-22:00'];
  
  weekdays.forEach(day => {
    weekdayTimes.forEach(time => {
      const hour = time.split('-')[0].split(':')[0];
      slots.push({
        id: `${day}_${hour}`,
        time: time,
        label: `${day} ${time}`,
        isWeekday: true,
        day: day
      });
    });
  });
  
  // 非工作日时间段（周六、周日分别显示）
  const weekendDays = ['周六', '周日'];
  const weekendTimes = ['10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'];
  
  weekendDays.forEach(day => {
    weekendTimes.forEach(time => {
      const hour = time.split('-')[0].split(':')[0];
      slots.push({
        id: `${day}_${hour}`,
        time: time,
        label: `${day} ${time}`,
        isWeekday: false,
        day: day
      });
    });
  });
  
  interviewTimeSlots.value = slots;
};

// 切换时间段选择
const toggleTimeSlot = (slotId) => {
  const index = form.interview_time_slots.indexOf(slotId);
  if (index > -1) {
    form.interview_time_slots.splice(index, 1);
  } else {
    form.interview_time_slots.push(slotId);
  }
};

// 检查时间段是否被选中
const isTimeSlotSelected = (slotId) => {
  return form.interview_time_slots.includes(slotId);
};

// Function to handle major name search
const searchMajor = async () => {
  // Only search if input has at least 2 characters
  if (form.major_name.length < 2) {
    majorSearchResults.value = [];
    return;
  }
  try {
    const response = await axios.post('/recruit/major_search', { major_name: form.major_name , grade: form.grade});
    majorSearchResults.value = response.data;
  } catch (error) {
    console.error('Major search failed:', error);
  }
};

// Function to handle major confirmation on blur
const confirmMajor = async () => {
  // If user leaves the input field, confirm the major
  if (!form.major_name) return;
  try {
    const response = await axios.post('/recruit/major_confirm', { major_name: form.major_name , grade: form.grade});
    if (response.data.length > 0) {
      const confirmedMajor = response.data[0];
      form.major_id = confirmedMajor.major_id;
      form.major_name = confirmedMajor.major_name;
      form.college_id = confirmedMajor.college_id;
      form.college_name = confirmedMajor.college_name;
      majorSearchResults.value = [];
    }
  } catch (error) {
    console.error('Major confirmation failed:', error);
  }
};

// Function to update department order
const updateDepartmentOrder = () => {
  console.log('Department order updated:', departmentList.value);
  form.office_department_willing = departmentList.value.find(dept => dept.id === 'office_department_willing').order;
  form.competition_department_willing = departmentList.value.find(dept => dept.id === 'competition_department_willing').order;
  form.research_department_willing = departmentList.value.find(dept => dept.id === 'research_department_willing').order;
  form.activity_department_willing = departmentList.value.find(dept => dept.id === 'activity_department_willing').order;
};

// Function to select a major from search results
const selectMajor = (major) => {
  form.major_name = major.major_name;
  form.major_id = major.major_id;
  form.college_id = major.college_id;
  form.college_name = major.college_name;
  majorSearchResults.value = []; // Clear results after selection
};

// 初始化时间段
generateTimeSlots();

// Function to handle resume file selection
const handleResumeFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // 验证文件类型
    if (file.type !== 'application/pdf') {
      window.notyf.error('请选择PDF格式的文件');
      event.target.value = '';
      return;
    }
    
    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      window.notyf.error('文件大小不能超过10MB');
      event.target.value = '';
      return;
    }
    
    resumeFile.value = file;
    resumeUploadStatus.value = '文件已选择: ' + file.name;
  }
};

// Function to upload resume
const uploadResume = async () => {
  if (!resumeFile.value) {
    window.notyf.error('请先选择PDF文件');
    return false;
  }
  
  if (!form.uid) {
    window.notyf.error('请先填写学号');
    return false;
  }
  
  resumeUploadLoading.value = true;
  resumeUploadStatus.value = '正在上传...';
  
  try {
    const formData = new FormData();
    formData.append('uid', form.uid);
    formData.append('resume_file', resumeFile.value);
    
    const response = await axios.post('/recruit/upload_resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    resumeUploadStatus.value = '上传成功: ' + response.data.message;
    window.notyf.success('简历上传成功！');
  } catch (error) {
    console.error('Resume upload failed:', error);
    if (error.response && error.response.data && error.response.data.detail) {
      resumeUploadStatus.value = '上传失败: ' + error.response.data.detail;
      window.notyf.error(`上传失败: ${error.response.data.detail}`);
    } else {
      resumeUploadStatus.value = '上传失败，请重试';
      window.notyf.error('上传失败，请重试');
    }
  } finally {
    resumeUploadLoading.value = false;
  }
  return true;
};

// 
const fetchDeadline = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(`/recruit/get_deadline`);
        const deadlineString = response.data.deadline; 
        
        const deadlineDate = new Date(deadlineString);
        const currentDate = new Date();
        
        recruitDeadline.value = deadlineString;
        isRecruiting.value = currentDate < deadlineDate; 
        
    } catch (error) {
        console.error("获取纳新截止日期失败:", error);
        isRecruiting.value = false; // 失败时，保守处理，假设已截止或无法判断。
        recruitDeadline.value = '状态获取失败'; 
    } finally {
        isLoading.value = false;
    }
};

// Function to submit the form
const submitForm = async () => {

// 
  if (!isRecruiting.value) {
    window.notyf.error(`纳新已于 ${recruitDeadline.value} 截止，无法提交表单。`);
    return;
  }

  // Mark all fields as touched for validation display
  fieldTouched.name = true;
  fieldTouched.uid = true;
  fieldTouched.phone = true;
  
  // Validate form before submission
  if (!validateForm()) {
    window.notyf.error('请检查表单中的错误信息');
    return;
  }

  // Map the ordered list back to the form object
  departmentList.value.forEach((dept, index) => {
    form[dept.id] = index + 1; // 1-based ranking
  });

  // Create a new payload object to send to the backend
  const payload = { ...form };

  // Convert grade data: Ensure it's a number
  if (payload.grade) {
    payload.grade = parseInt(payload.grade, 10);
  }
  
  // Convert degree data: Map Chinese names to numerical codes
  const degreeMap = {
    '学士': 0,
    '硕士': 1,
    '博士': 2,
    '博士后': 3,
  };
  payload.degree = degreeMap[payload.degree] !== undefined ? degreeMap[payload.degree] : 4;

  // 为硕士和博士设置默认的教学计划号和学院信息
  if (payload.degree !== 0) {
    if (!payload.major_id) {
      payload.major_id = 'DEFAULT_MASTER_PHD'; // 默认教学计划号
    }
    if (!payload.college_id) {
      payload.college_id = 'DEFAULT_COLLEGE'; // 默认学院ID
    }
    if (!payload.college_name) {
      payload.college_name = '默认学院'; // 默认学院名称
    }
  }

  // Debug: Log the payload being sent
  console.log('Sending payload to backend:', payload);

  try {
    const response = await axios.post('/recruit/recruit_confirm', payload);
    
    // 处理简历上传
    if (resumeFile.value && !await uploadResume()) {
      window.notyf.error('简历上传失败');
      return;
    }
    
    // 提交成功，显示成功页面
    submitSuccess.value = true;
    countdown.value = 5;
    
    // 开始倒计时
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        // 跳转到首页
        window.location.href = '/';
      }
    }, 1000);
    
  } catch (error) {
    console.error('Full error response:', error.response);
    if (error.response && error.response.data && error.response.data.detail) {
      if (error.response.status === 403 || error.response.data.detail.includes('截止')) { 
         window.notyf.error(`报名已截止，无法提交。`);
      } else {
         window.notyf.error(`提交失败: ${error.response.data.detail}`);
      }
    } else {
      window.notyf.error('提交失败，请重试。');
    }
    console.error('Form submission failed:', error);
  }
};

onMounted(() => {
    fetchDeadline();
});

</script>

<template>
  <div v-if="submitSuccess" class="success-container">
    <div class="success-content">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>
      <h1 class="success-title">报名提交成功！</h1>
      <div class="success-message">
        <p>感谢您报名浙江大学学生网络空间安全协会！</p>
        <p>请及时查看钉钉OA，确认您的报名信息。</p>
        <p>我们将在钉钉OA中通知您面试安排，请保持手机畅通。</p>
      </div>
      <div class="countdown-info">
        <p>{{ countdown }} 秒后自动跳转到官网首页</p>
        <div class="countdown-bar">
          <div class="countdown-progress" :style="{ width: (countdown / 5) * 100 + '%' }"></div>
        </div>
      </div>
      <div class="success-actions">
        <button @click="window.location.href='/'" class="btn-primary">
          立即跳转到首页
        </button>
      </div>
    </div>
  </div>
  
  <div v-else-if="isCheckingStatus" class="form-container">
      <div class="status-box loading-box">
          <h2 class="form-title">正在检查纳新状态...</h2>
          <p>请稍候...</p>
      </div>
  </div>

  <div v-else-if="!isRecruiting" class="form-container">
      <div class="status-box closed-box">
          <h2 class="form-title" style="color: #f44336;">🔔 纳新已截止</h2>
          <p>感谢您关注浙江大学学生网络空间安全协会！</p>
          <p>本期纳新截止日期为：<span style="font-weight: bold; color: #f44336;">{{ recruitDeadline }}</span></p>
          <p>请关注我们公众号“ZJU网小安”，获取最新纳新信息。</p>
          <!-- <div class="success-actions" style="margin-top: 2rem;">
            <button @click="window.location.href='/'" class="btn-primary">
              返回首页
            </button>
          </div> -->
      </div>
  </div>

  <div v-else class="form-container">
    <form @submit.prevent="submitForm">
      <h2 class="form-title" style="font-size: 24px;">2025浙江大学学生网络空间安全协会纳新报名表</h2>
      <div class="description">
        <span style="color: rgb(1, 98, 244);">欢迎报名浙江大学网络空间安全协会！</span>
        <div>请抽出5-10分钟的时间认真阅读并填写本问卷，以便协会统计面试信息，谢谢您的配合~</div>
        <div>温馨提示：如果对浙江大学学生网络空间安全协会（CSA）各部门职能暂不明确，可以查看<span style="color: rgb(1, 98, 244);">ZJU网小安</span><span style="color: rgb(0, 0, 0);">（</span>公众号）纳新推文，也可在<span style="color: rgb(1, 98, 244);">纳新咨询群</span>（二维码在问卷末尾）提问哦~</div>
      </div>
      
      <div class="input-format-guide">
        <h4>📝 填写说明：</h4>
        <ul>
          <li><span class="required">*</span> 表示必填字段</li>
        </ul>
      </div>
      
      <div class="form-group">
        <label for="name">姓名: <span class="required">*</span></label>
        <input 
          type="text" 
          id="name" 
          v-model="form.name" 
          @blur="validateName(form.name)"
          @input="debouncedValidateName(form.name)"
          required
          :class="{ 'error-input': validationErrors.name && fieldTouched.name }"
        >
        <span v-if="validationErrors.name && fieldTouched.name" class="error-message">{{ validationErrors.name }}</span>
      </div>

      <div class="form-group">
        <label for="render">性别: <span class="required">*</span></label>
        <select id="render" v-model="form.render" required>
          <option :value="false">男</option>
          <option :value="true">女</option>
        </select>
      </div>

      <div class="form-group">
        <label for="uid">学号: <span class="required">*</span></label>
        <input 
          type="text" 
          id="uid" 
          v-model="form.uid" 
          @blur="validateUid(form.uid)"
          @input="debouncedValidateUid(form.uid)"
          required
          :class="{ 'error-input': validationErrors.uid && fieldTouched.uid }"
        >
        <span v-if="validationErrors.uid && fieldTouched.uid" class="error-message">{{ validationErrors.uid }}</span>
      </div>
      
      <div class="form-group">
        <label for="degree">在读学位:<span class="required">*</span></label>
        <select id="degree" v-model="form.degree" required>
          <option disabled value="">请选择学位</option>
          <option value="学士">学士</option>
          <option value="硕士">硕士</option>
          <option value="博士">博士</option>
          <option value="博士后">博士后</option>
        </select>
      </div>

      <div class="form-group">
        <label for="grade">年级:<span class="required">*</span></label>
        <select id="grade" v-model.number="form.grade" required>
          <option disabled value="">请选择年级</option>
          <option value="25">25级</option>
          <option value="24">24级</option>
          <option value="23">23级</option>
          <option value="22">22级</option>
          <option value="21">21级</option>
        </select>
      </div>
      <div class="form-group" v-if="form.degree == '学士' && form.grade !== null">
        <label for="major_name">专业:<span class="required">*</span></label>
        <input type="text" id="major_name" v-model="form.major_name" @input="searchMajor" @blur="confirmMajor" required>
        <ul v-if="majorSearchResults.length > 0" class="major-search-results">
          <li v-for="major in majorSearchResults" :key="major.major_id" @click="selectMajor(major)">
            {{ major.major_name }}
          </li>
        </ul>
      </div>
      <div class="form-group" v-if="form.degree !== '学士' && form.grade !== null">
        <label for="major_name">专业:<span class="required">*</span></label>
        <input type="text" id="major_name" v-model="form.major_name" required>
      </div>
      <div class="form-group" v-if="form.degree == '学士' && form.grade !== null">
        <label for="college_name">学院:<span class="required">*</span></label>
        <input type="text" id="college_name" v-model="form.college_name" disabled>
      </div>
      <div class="form-group" v-if="form.degree !== null && form.degree !== '学士' && form.grade !== null">
        <label for="college_name">学院:<span class="required">*</span></label>
        <input type="text" id="college_name" v-model="form.college_name" required>
      </div>

      <div class="form-group" v-if="form.degree == '学士' && form.grade !== null">
        <label for="major_id">教学计划号:<span class="required">*</span></label>
        <input type="text" id="major_id" v-model="form.major_id" disabled>
      </div>


      <div class="form-group">
        <label for="phone">手机号: <span class="required">*</span></label>
        <input 
          type="text" 
          id="phone" 
          v-model="form.phone" 
          @blur="validatePhone(form.phone)"
          @input="debouncedValidatePhone(form.phone)"
          required
          :class="{ 'error-input': validationErrors.phone && fieldTouched.phone }"
        >
        <span v-if="validationErrors.phone && fieldTouched.phone" class="error-message">{{ validationErrors.phone }}</span>
      </div>

      <div class="form-group">
        <label>部门意愿排序 (拖拽调整顺序，1为最高优先级):<span class="required">*</span></label>
        <div class="department-list-wrapper">
          <draggable v-model="departmentList" item-key="id" @change="updateDepartmentOrder">
            <template #item="{ element, index }">
              <div class="drag-item">
                <span class="rank-number">{{ index + 1 }}.</span>
                <span class="department-name">{{ element.name }}</span>
                <span class="drag-handle">☰</span>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <div class="form-group">
        <label for="introduction">请您简单介绍一下自己（兴趣爱好，性格，对网安协会的了解，以及为什么想加入网安协会，不超过250字）:<span class="required">*</span></label>
        <textarea id="introduction" v-model="form.introduction" maxlength="250" required></textarea>
      </div>


      <div class="form-group">
        <label for="skill">请您介绍一下自己的特长与技能（比如剪辑，摄影，活动策划，活动组织，竞赛经历，科研经历等，不超过250字）:<span class="required">*</span></label>
        <textarea id="skill" v-model="form.skill" maxlength="250" required></textarea>
      </div>

      <div class="form-group">
        <label>请选择您可参加面试的时间段（可多选）:<span class="required">*</span></label>
        <div class="time-slots-hint">
          <i class="pi pi-info-circle"></i>
          <span>请至少选择四个时间段，以便我们更好地安排面试时间</span>
        </div>
        <div class="time-slots-container">
          <div class="time-slots-header">
            <div class="weekday-slots">
              <h4>工作日时间段（19:00-22:00）</h4>
              <div class="weekday-groups">
                <div v-for="day in ['周一', '周二', '周三', '周四', '周五']" :key="day" class="day-group">
                  <h5>{{ day }}</h5>
                  <div class="time-slots-grid">
                    <div 
                      v-for="slot in interviewTimeSlots.filter(s => s.isWeekday && s.day === day)" 
                      :key="slot.id"
                      class="time-slot"
                      :class="{ 'selected': isTimeSlotSelected(slot.id) }"
                      @click="toggleTimeSlot(slot.id)"
                    >
                      <div class="slot-label">{{ slot.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="weekend-slots">
              <h4>非工作日时间段（10:00-22:00）</h4>
              <div class="weekend-groups">
                <div v-for="day in ['周六', '周日']" :key="day" class="day-group">
                  <h5>{{ day }}</h5>
                  <div class="time-slots-grid">
                    <div 
                      v-for="slot in interviewTimeSlots.filter(s => !s.isWeekday && s.day === day)" 
                      :key="slot.id"
                      class="time-slot"
                      :class="{ 'selected': isTimeSlotSelected(slot.id) }"
                      @click="toggleTimeSlot(slot.id)"
                    >
                      <div class="slot-label">{{ slot.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="form.interview_time_slots.length > 0" class="selected-slots">
            <h5>已选择的时间段：</h5>
            <div class="selected-slots-list">
              <span 
                v-for="slotId in form.interview_time_slots" 
                :key="slotId"
                class="selected-slot-tag"
              >
                {{ interviewTimeSlots.find(s => s.id === slotId)?.label }}
              </span>
            </div>
            <div class="time-slots-counter" :class="{ 'warning': form.interview_time_slots.length < 4 }">
              <span>已选择 {{ form.interview_time_slots.length }} 个时间段</span>
              <span v-if="form.interview_time_slots.length < 4" class="counter-warning">
                （还需选择 {{ 4 - form.interview_time_slots.length }} 个时间段）
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group checkbox-group">
        <input type="checkbox" id="reassign_agreement" v-model="form.if_agree_to_be_reassigned">
        <label for="reassign_agreement">同意调剂</label>
      </div>

      <div class="form-group checkbox-group">
        <input type="checkbox" id="member_agreement" v-model="form.if_be_member">
        <label for="member_agreement">同意成为浙江大学学生网络空间安全协会会员</label>
      </div>

      <div v-if="(validationErrors.name && fieldTouched.name) || (validationErrors.uid && fieldTouched.uid) || (validationErrors.phone && fieldTouched.phone)" class="validation-summary">
        <h4>请修正以下错误：</h4>
        <ul>
          <li v-if="validationErrors.name && fieldTouched.name">姓名: {{ validationErrors.name }}</li>
          <li v-if="validationErrors.uid && fieldTouched.uid">学号: {{ validationErrors.uid }}</li>
          <li v-if="validationErrors.phone && fieldTouched.phone">手机号: {{ validationErrors.phone }}</li>
        </ul>
      </div>

            <div class="form-group">
        <label for="resume">简历上传 (可选):</label>
        <div class="resume-upload-container">
          <input 
            type="file" 
            id="resume" 
            accept=".pdf"
            @change="handleResumeFileChange"
            class="file-input"
          >
          <!-- <button 
            type="button" 
            @click="uploadResume" 
            :disabled="!resumeFile || resumeUploadLoading"
            class="upload-button"
          > -->
            <!-- {{ resumeUploadLoading ? '上传中...' : '上传简历' }}
          </button> -->
        </div>
        <div v-if="resumeUploadStatus" class="upload-status" :class="{ 'success': resumeUploadStatus.includes('成功'), 'error': resumeUploadStatus.includes('失败'), 'uploading': resumeUploadStatus.includes('正在上传') }">
          {{ resumeUploadStatus }}
        </div>
        <div class="upload-hint">
          <small>支持PDF格式，文件大小不超过10MB</small>
        </div>
      </div>

      <button type="submit" class="submit-button">提交</button>
      

    </form>
    <br>
    <span style="font-size: 1.2rem; font-weight: bold;">加入纳新咨询群，获取更多信息！</span>
    <div class="picture-container">
        <img src="@/assets/recruitment.jpg" alt="纳新咨询群">
      </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--bg-surface);
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--shadow-color);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-title {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 2rem;
  transition: color 0.3s ease;
}

.description {
  background-color: rgba(102, 126, 234, 0.1);
  border-left: 5px solid var(--accent-color);
  padding: 15px;
  margin-bottom: 2rem;
  border-radius: 4px;
  line-height: 1.6;
  color: var(--text-primary);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.input-format-guide {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 5px solid #4caf50;
  padding: 15px;
  margin-bottom: 2rem;
  border-radius: 4px;
  line-height: 1.6;
  color: var(--text-primary);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.input-format-guide h4 {
  color: #4caf50;
  margin-top: 0;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.input-format-guide ul {
  padding-left: 1.5rem;
}

.input-format-guide li {
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.3s, background-color 0.3s ease, color 0.3s ease;
  background-color: var(--bg-surface);
  color: var(--text-primary);
}

input[type="text"]:focus,
textarea:focus,
select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.major-search-results {
  list-style-type: none;
}

/* 面试时间段样式 */
.time-slots-container {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  background-color: var(--bg-secondary);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.time-slots-header h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.weekday-slots, .weekend-slots {
  margin-bottom: 2rem;
}

.weekday-groups, .weekend-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.day-group {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  background-color: var(--bg-surface);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.day-group h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: color 0.3s ease, border-color 0.3s ease;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.day-group .time-slots-grid {
  grid-template-columns: repeat(3, 1fr);
}

.weekend-groups .day-group .time-slots-grid {
  grid-template-columns: repeat(3, 1fr);
}

.time-slot {
  background: var(--bg-surface);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  color: var(--text-primary);
}

.time-slot:hover {
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.time-slot.selected {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.time-slot.selected:hover {
  background: var(--accent-hover);
}

.slot-label {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}

.selected-slots {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
}

.selected-slots h5 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.selected-slots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-slot-tag {
  background: rgba(102, 126, 234, 0.1);
  color: var(--accent-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.time-slots-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 4px;
  color: #4caf50;
  font-size: 0.9rem;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.time-slots-hint i {
  color: #4caf50;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.time-slots-counter {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.time-slots-counter.warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ff9800;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.counter-warning {
  color: #f57c00;
  font-weight: 600;
}

.major-search-results {
  list-style-type: none;
  padding: 0;
  margin: 0.5rem 0 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-surface);
  max-height: 150px;
  overflow-y: auto;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.major-search-results li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.3s ease;
  color: var(--text-primary);
}

.major-search-results li:hover {
  background-color: var(--bg-secondary);
}

.department-list-wrapper {
  margin-top: 1rem;
}

.drag-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: grab;
  transition: box-shadow 0.2s, background-color 0.2s, border-color 0.3s ease;
}

.drag-item:hover {
  background-color: var(--bg-secondary);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.sortable-chosen {
  background-color: rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.rank-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-right: 15px;
  transition: color 0.3s ease;
}

.department-name {
  flex-grow: 1;
  font-size: 1.1rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.drag-handle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: grab;
  line-height: 1;
  transition: color 0.3s ease;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group label {
  margin-left: 0.5rem;
  margin-bottom: 0;
  cursor: pointer;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  transition: color 0.3s ease;
}

.required {
  color: #f44336;
  margin-left: 0.2rem;
  transition: color 0.3s ease;
}

.error-input {
  border-color: #f44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
}

.validation-summary {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.validation-summary h4 {
  color: #f44336;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.validation-summary ul {
  margin: 0;
  padding-left: 1.5rem;
}

.validation-summary li {
  color: #f44336;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.resume-upload-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
}

.file-input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.upload-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button:hover:not(:disabled) {
  background-color: #45a049;
}

.upload-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.upload-status {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.upload-status.success {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.upload-status.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #f44336;
}

.upload-status.uploading {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #2196f3;
}

.upload-hint {
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-style: italic;
  transition: color 0.3s ease;
}

/* 成功页面样式 */
.success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
  padding: 2rem;
  transition: background 0.3s ease;
}

.success-content {
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px var(--shadow-color);
  max-width: 500px;
  width: 100%;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.success-icon {
  margin-bottom: 2rem;
}

.success-icon i {
  font-size: 4rem;
  color: #4caf50;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.success-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

.success-message {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.success-message p {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.countdown-info {
  margin-bottom: 2rem;
}

.countdown-info p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.countdown-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.countdown-progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #45a049);
  border-radius: 4px;
  transition: width 1s linear;
}

.success-actions {
  margin-top: 2rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .success-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .success-title {
    font-size: 1.5rem;
  }
  
  .success-message p {
    font-size: 1rem;
  }
}
</style>