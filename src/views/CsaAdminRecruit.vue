<script setup>
import { computed, ref, reactive, inject, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import AdminDateField from '@/components/admin/AdminDateField.vue';
import AdminFilterSelect from '@/components/admin/AdminFilterSelect.vue';

const confirm = useConfirm();
const axios = inject('axios');
// 数据状态
const recruits = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const sortField = ref('');
const sortOrder = ref('asc');
const first = computed(() => Math.max(0, (currentPage.value - 1) * pageSize.value));

const newDeadline = ref('');
const currentDeadline = ref('正在加载...');
const isRecruiting = ref(false);
const isSubmitting = ref(false); 
const message = ref('');
const messageType = ref('');
const modifyDeadline = ref(false);
// 模态框状态
const showModal = ref(false);

const showEvaluationModalVisible = ref(false);
const showExportModal = ref(false);
const showInterviewModal = ref(false);
const selectedRecruit = ref(null);
const selectAllRecruits = ref(false);

const fetchDeadline = async () => {
    loading.value = true;
    message.value = '';
    currentDeadline.value = '正在加载...';
    try {
        const response = await axios.get(`/recruit/get_deadline`); 
        const deadlineString = response.data.deadline; 
        console.log(response);
        if (deadlineString) {
            currentDeadline.value = deadlineString;
            const deadlineDate = new Date(deadlineString);
            const currentDate = new Date();
            isRecruiting.value = currentDate > deadlineDate; 
            
            newDeadline.value = deadlineString.split('T')[0] || deadlineString; 
        } else {
            currentDeadline.value = '未设置截止日期';
            isRecruiting.value = true; 
        }
    } catch (error) {
        console.error("获取截止日期失败:", error);
        currentDeadline.value = '获取失败';
        message.value = `获取失败：${error.response?.data?.message || '请检查网络或后端接口'}`;
        messageType.value = 'error';
        isRecruiting.value = true;
    } finally {
        loading.value = false;
    }
};

const handleSetDeadline = async () => {
    if (!newDeadline.value) {
        message.value = '请选择一个截止日期！';
        messageType.value = 'error';
        return;
    }
    isSubmitting.value = true;
    message.value = '';
    
    try {
        await axios.post('/admin/set_recruit_deadline', {
            deadline: newDeadline.value
        });
        
        messageType.value = 'success';
        await fetchDeadline(); 
        window.notyf.success(`招新截止日期设置成功：${newDeadline.value}`);
        modifyDeadline.value = false;
    } catch (error) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || '请检查您的管理员权限或后端';
        window.notyf.error(`设置失败：${errorMessage}`);
    } finally {
        isSubmitting.value = false;
    }
};

const evaluationForm = reactive({
  comment: '',
  department: '',
  // 评分项目（1-10分）
  technical_skills: null,
  communication_skills: null,
  problem_solving: null,
  teamwork: null,
  learning_ability: null,
  motivation: null,
  // 总体评价
  strengths: '',
  weaknesses: '',
  // 推荐部门
  recommended_department: '',
  // 评价结果
  result: 'pending' 
});

// 评价列表
const evaluations = ref([]);
const evaluationLoading = ref(false);

// 面试相关
const interviews = ref([]);
const interviewLoading = ref(false);
const showInterviewForm = ref(false);
const editingInterview = ref(null);

// 面试表单
const interviewForm = reactive({
      stage: 'first_round',
  interview_date: new Date().toISOString().slice(0, 16),
  interview_completed: false,
  interview_duration: null,
  technical_skills: null,
  communication_skills: null,
  problem_solving: null,
  teamwork: null,
  learning_ability: null,
  motivation: null,
  result: 'pending',
  strengths: '',
  weaknesses: '',
  technical_questions: '',
  behavioral_questions: '',
  additional_notes: '',
  recommended_department: ''
});

// 面试统计
const interviewStats = ref(null);
const statsLoading = ref(false);

// 导出选项
const exportOptions = reactive({
  include_basic_info: true,
  include_department_preference: true,
  include_evaluation: true,
  include_contact: true,
  include_introduction: true,
  export_format: 'excel' // excel, csv
});

// 筛选条件
const filters = reactive({
  name: '',
  uid: '',
  degree: '',
  grade: '',
  major_name: '',
  status: 'all', // all, pending, accepted, rejected
  department: 'all', // all, office, competition, research, activity
  interview_time_slot: '' // 已排班面试时间段筛选
});

// 已排班面试时间段选项
const interviewTimeSlots = ref([]);

// 面试基准日期
const interviewBaseDate = ref(new Date().toISOString().slice(0, 10));

// 面试状态选项
const interviewStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: '待面试', label: '待面试' },
  { value: '已通过一面', label: '已通过一面' },
  { value: '已通过二面', label: '已通过二面' },
  { value: '待录取', label: '待录取' },
  { value: '已录取', label: '已录取' },
  { value: '已拒绝', label: '已拒绝' }
];

// 学位选项
const degreeOptions = [
  { value: 0, label: '学士' },
  { value: 1, label: '硕士' },
  { value: 2, label: '博士' },
  { value: 3, label: '博士后' }
];

// 部门选项
const departmentOptions = [
  { value: 'all', label: '全部部门' },
  { value: 'office', label: '办公室部' },
  { value: 'competition', label: '竞赛部' },
  { value: 'research', label: '科研部' },
  { value: 'activity', label: '活动部' }
];

// 分配部门选项
const assignDepartmentOptions = [
  { value: '', label: '未分配' },
  { value: 'office', label: '办公室部' },
  { value: 'competition', label: '竞赛部' },
  { value: 'research', label: '科研部' },
  { value: 'activity', label: '活动部' }
];

// 年级选项
const gradeOptions = [
  { value: 21, label: '21级' },
  { value: 22, label: '22级' },
  { value: 23, label: '23级' },
  { value: 24, label: '24级' },
  { value: 25, label: '25级' }
];

const DEGREE_ALL_VALUE = '__all_degree__';
const GRADE_ALL_VALUE = '__all_grade__';
const TIME_SLOT_ALL_VALUE = '__all_interview_time_slot__';
const RECOMMENDED_DEPARTMENT_NONE_VALUE = '__no_recommended_department__';
const INTERVIEW_NOT_COMPLETED_VALUE = '__interview_not_completed__';

const createMappedProxy = (source, key, rawValue, uiValue) => computed({
  get() {
    return Object.is(source[key], rawValue) ? uiValue : source[key];
  },
  set(value) {
    source[key] = value === uiValue ? rawValue : value;
  }
});

const degreeFilterValue = createMappedProxy(filters, 'degree', '', DEGREE_ALL_VALUE);
const gradeFilterValue = createMappedProxy(filters, 'grade', '', GRADE_ALL_VALUE);
const interviewTimeSlotFilterValue = createMappedProxy(filters, 'interview_time_slot', '', TIME_SLOT_ALL_VALUE);
const evaluationRecommendedDepartmentValue = createMappedProxy(
  evaluationForm,
  'recommended_department',
  '',
  RECOMMENDED_DEPARTMENT_NONE_VALUE
);
const interviewRecommendedDepartmentValue = createMappedProxy(
  interviewForm,
  'recommended_department',
  '',
  RECOMMENDED_DEPARTMENT_NONE_VALUE
);
const interviewCompletedValue = createMappedProxy(
  interviewForm,
  'interview_completed',
  false,
  INTERVIEW_NOT_COMPLETED_VALUE
);

const degreeFilterOptions = [{ value: DEGREE_ALL_VALUE, label: '全部' }, ...degreeOptions];
const gradeFilterOptions = [{ value: GRADE_ALL_VALUE, label: '全部' }, ...gradeOptions];
const recommendedDepartmentOptions = [
  { value: RECOMMENDED_DEPARTMENT_NONE_VALUE, label: '未推荐' },
  { value: 'office', label: '办公室部' },
  { value: 'competition', label: '竞赛部' },
  { value: 'research', label: '科研部' },
  { value: 'activity', label: '活动部' }
];
const evaluationResultOptions = [
  { value: 'pending', label: '待定' },
  { value: 'pass', label: '通过' },
  { value: 'fail', label: '不通过' },
  { value: 'recommended', label: '推荐' }
];
const interviewStageOptions = [
  { value: 'first_round', label: '一面' },
  { value: 'second_round', label: '二面' }
];
const interviewCompletedOptions = [
  { value: INTERVIEW_NOT_COMPLETED_VALUE, label: '未完成' },
  { value: true, label: '已完成' }
];
const interviewResultOptions = [
  { value: 'pending', label: '待定' },
  { value: 'pass', label: '通过' },
  { value: 'fail', label: '未通过' },
  { value: 'recommended', label: '推荐' }
];
const interviewTimeSlotOptions = computed(() => [
  { value: TIME_SLOT_ALL_VALUE, label: '全部时间段' },
  ...interviewTimeSlots.value.map(slot => ({
    value: slot.id,
    label: `${slot.name} (${slot.current_count}/${slot.max_capacity})`
  }))
]);

// 获取已排班面试时间段列表
const fetchInterviewTimeSlots = async () => {
  try {
    const response = await axios.get('/interview/time-slots', {
      params: {
        base_date: interviewBaseDate.value
      }
    });
    interviewTimeSlots.value = response.data.time_slots || [];
  } catch (error) {
    console.error('Failed to fetch interview time slots:', error);
  }
};

// 处理基准日期变化
const handleBaseDateChange = () => {
  fetchInterviewTimeSlots();
};

// 获取纳新者列表
const fetchRecruits = async () => {
  loading.value = true;

  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...filters
    };

    if (sortField.value) {
      params.sort_field = sortField.value;
      params.sort_order = sortOrder.value;
    }
    
    const response = await axios.get('/recruit/recruits', { params });
    recruits.value = response.data.recruits;
    total.value = response.data.total;
  } catch (error) {
    console.error('Failed to fetch recruits:', error);
  } finally {
    loading.value = false;
  }
};

// 更新评价状态
const updateEvaluation = async (uid, status, comment = '') => {
  try {
    await axios.post('/recruit/update_evaluation', {
      uid,
      status,
      comment
    });
    
    // 刷新列表
    await fetchRecruits();
    window.notyf.success('评价更新成功');
  } catch (error) {
    console.error('Failed to update evaluation:', error);
    window.notyf.error('评价更新失败');
  }
};



// 批量删除
const batchDeleteRecruits = async () => {
  const selectedRecruits = recruits.value.filter(r => r.selected);
  if (selectedRecruits.length === 0) {
    window.notyf.error('请选择要删除的纳新者');
    return;
  }
  
  confirm.require({
    message: `确定要删除选中的 ${selectedRecruits.length} 名纳新者记录吗？此操作不可恢复！`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        for (const recruit of selectedRecruits) {
          await axios.post('/recruit/delete_recruit', {
            uid: recruit.uid
          });
        }
        
        await fetchRecruits();
        window.notyf.success(`成功删除 ${selectedRecruits.length} 条纳新记录`);
      } catch (error) {
        console.error('Batch delete failed:', error);
        window.notyf.error('批量删除失败：' + (error.response?.data?.detail || error.message));
      }
    }
  });
};



// 导出数据
const exportData = async () => {
  try {
    // 显示加载状态
    window.notyf.success('正在导出数据，请稍候...');
    
    const response = await axios.get('/recruit/export_recruits', {
      params: {
        ...filters,
        ...exportOptions
      },
      responseType: 'blob'
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名（包含当前时间）
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const format = exportOptions.exportFormat === 'csv' ? 'csv' : 'xlsx';
    link.setAttribute('download', `纳新者数据_${timestamp}.${format}`);
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // 清理URL对象
    window.URL.revokeObjectURL(url);
    
    // 关闭导出模态框
    showExportModal.value = false;
    
    window.notyf.success('数据导出成功！');
  } catch (error) {
    console.error('Export failed:', error);
    window.notyf.error('导出失败：' + (error.response?.data?.detail || error.message));
  }
};

// 显示导出选项模态框
const showExportOptions = () => {
  showExportModal.value = true;
};

// 获取部门意愿排序
const getDepartmentOrder = (recruit) => {
  const departments = [
    { id: 'office', name: '办公室部', score: recruit.office_department_willing },
    { id: 'competition', name: '竞赛部', score: recruit.competition_department_willing },
    { id: 'research', name: '科研部', score: recruit.research_department_willing },
    { id: 'activity', name: '活动部', score: recruit.activity_department_willing }
  ];
  
  // 按照志愿度从高到低排序（1为最高志愿度，4为最低志愿度）
  return departments.sort((a, b) => a.score - b.score);
};

// 获取学位标签
const getDegreeLabel = (degree) => {
  const option = degreeOptions.find(d => d.value === degree);
  return option ? option.label : '未知';
};

// 获取部门标签
const getDepartmentLabel = (department) => {
  if (!department) return '未分配';
  const option = assignDepartmentOptions.find(d => d.value === department);
  return option ? option.label : '未知部门';
};

// 获取部门样式
const getDepartmentStyle = (department) => {
  if (!department) {
    return { color: 'var(--recruit-department-empty-text)', backgroundColor: 'var(--recruit-department-empty-bg)' };
  }
  
  const styles = {
    'office': { color: 'var(--recruit-department-office-text)', backgroundColor: 'var(--recruit-department-office-bg)' },
    'competition': { color: 'var(--recruit-department-competition-text)', backgroundColor: 'var(--recruit-department-competition-bg)' },
    'research': { color: 'var(--recruit-department-research-text)', backgroundColor: 'var(--recruit-department-research-bg)' },
    'activity': { color: 'var(--recruit-department-activity-text)', backgroundColor: 'var(--recruit-department-activity-bg)' }
  };
  
  return styles[department] || { color: 'var(--recruit-department-empty-text)', backgroundColor: 'var(--recruit-department-empty-bg)' };
};

// 计算面试状态
const calculateInterviewStatus = (recruit) => {
  // 如果已录取
  if (recruit.is_admitted) {
    return '已录取';
  }
  
  // 如果已拒绝
  if (recruit.evaluation_status === 'rejected') {
    return '已拒绝';
  }
  
  // 如果已通过二面但还没录取
  if (recruit.second_round_passed) {
    return '待录取';
  }
  
  // 如果已通过一面但还没通过二面
  if (recruit.first_round_passed) {
    return '已通过一面';
  }
  
  return '待面试';
};

// 判断状态是否被锁定
const isStatusLocked = computed(() => {
  if (!selectedRecruit.value) return false;
  
  // 如果已录取，状态锁定
  if (selectedRecruit.value.is_admitted) {
    return true;
  }

  // 如果已拒绝，状态锁定
  if (selectedRecruit.value.status === 'rejected') {
    return true;
  }
  
  return false;
});

// 判断拒绝按钮是否被锁定
const isRejectLocked = computed(() => {
  if (!selectedRecruit.value) return false;
  
  if (selectedRecruit.value.is_admitted) {
    return true;
  }
  
  // 如果已拒绝，拒绝按钮锁定
  if (selectedRecruit.value.evaluation_status === 'rejected') {
    return true;
  }
  
  // 如果已通过一面和二面，拒绝按钮锁定（只能录取，不能拒绝）
  if (selectedRecruit.value.first_round_passed && selectedRecruit.value.second_round_passed) {
    return true;
  }
  
  return false;
});

const getStatusStyle = (status) => {
  switch (status) {
    case '待面试':
      return { color: 'var(--recruit-status-pending-text)', backgroundColor: 'var(--recruit-status-pending-bg)' };
    case '已通过一面':
      return { color: 'var(--recruit-status-first-text)', backgroundColor: 'var(--recruit-status-first-bg)' };
    case '已通过二面':
      return { color: 'var(--recruit-status-second-text)', backgroundColor: 'var(--recruit-status-second-bg)' };
    case '待录取':
      return { color: 'var(--recruit-status-admit-text)', backgroundColor: 'var(--recruit-status-admit-bg)' };
    case '已录取':
      return { color: 'var(--recruit-status-enrolled-text)', backgroundColor: 'var(--recruit-status-enrolled-bg)' };
    case '已拒绝':
      return { color: 'var(--recruit-status-rejected-text)', backgroundColor: 'var(--recruit-status-rejected-bg)' };
    default:
      return { color: 'var(--recruit-status-default-text)', backgroundColor: 'var(--recruit-status-default-bg)' };
  }
};

// 全选功能
const selectAll = () => {
  recruits.value.forEach(recruit => {
    recruit.selected = selectAllRecruits.value;
  });
};

// 显示评价模态框
const showEvaluationModal = async (recruit) => {
  selectedRecruit.value = recruit;
  evaluationForm.comment = '';
  evaluationForm.department = '';
  showEvaluationModalVisible.value = true;
  await fetchEvaluations(recruit.uid);
};

// 关闭模态框
const closeModal = () => {
  showModal.value = false;
  selectedRecruit.value = null;
  evaluationForm.status = 'pending';
  evaluationForm.comment = '';
};

// 提交评价
const submitEvaluation = async () => {
  if (!selectedRecruit.value) return;
  
  try {
    await updateEvaluation(
      selectedRecruit.value.uid,
      evaluationForm.status,
      evaluationForm.comment
    );
    closeModal();
  } catch (error) {
    console.error('Submit evaluation failed:', error);
  }
};

// 获取纳新者详细信息
const fetchRecruitDetail = async (uid) => {
  try {
    const response = await axios.get(`/recruit/recruit-detail/${uid}`);
    selectedRecruit.value = response.data;
  } catch (error) {
    console.error('获取纳新者详情失败:', error);
  }
};

// 面试相关函数
const getInterviewStageLabel = (stage) => {
  const labels = {
    'first_round': '一面',
    'second_round': '二面',
    'completed': '已完成'
  };
  return labels[stage] || stage;
};

const passInterview = async (roundType) => {
  if (!selectedRecruit.value) return;
  
  // 检查面试是否已完成
  if (roundType === 'first_round' && selectedRecruit.value.interview_status !== 'first_round') {
    window.notyf.error('一面面试尚未完成，无法通过一面');
    return;
  }
  
  if (roundType === 'second_round' && selectedRecruit.value.interview_status !== 'second_round') {
    window.notyf.error('二面面试尚未完成，无法通过二面');
    return;
  }
  
  // 添加确认提示
  const roundName = roundType === 'first_round' ? '一面' : '二面';
  const warningMessage = roundType === 'first_round' 
    ? `确定要通过 ${selectedRecruit.value.name} 的第一轮面试吗？\n\n⚠️ 重要提醒：通过面试后无法取消，请谨慎操作！`
    : `确定要通过 ${selectedRecruit.value.name} 的第二轮面试吗？\n\n⚠️ 重要提醒：通过面试后无法取消，请谨慎操作！`;
  
  confirm.require({
    message: warningMessage,
    header: `确认通过${roundName}`,
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        const response = await axios.post('/recruit/interview-pass', {
          uid: selectedRecruit.value.uid,
          round_type: roundType
        });
        
        if (response.data.success) {
          window.notyf.success(`${roundName}通过处理成功！`);
          // 刷新数据
          await fetchRecruits();
          // 重新获取详情
          await fetchRecruitDetail(selectedRecruit.value.uid);
        } else {
          window.notyf.error('面试通过处理失败：' + response.data.message);
        }
      } catch (error) {
        console.error('面试通过处理失败:', error);
        window.notyf.error('面试通过处理失败：' + (error.response?.data?.detail || error.message));
      }
    }
  });
};



// 查看详情
const viewDetails = async (recruit) => {
  selectedRecruit.value = recruit;
  showEvaluationModalVisible.value = true;
  // 获取详细信息
  await fetchRecruitDetail(recruit.uid);
  // 获取评价列表
  await fetchEvaluations(recruit.uid);
};



// 获取评价列表
const fetchEvaluations = async (uid) => {
  evaluationLoading.value = true;
  try {
    const response = await axios.get(`/recruit/evaluations/${uid}`);
    evaluations.value = response.data.evaluations;
  } catch (error) {
    console.error('Failed to fetch evaluations:', error);
    window.notyf.error('获取评价列表失败');
  } finally {
    evaluationLoading.value = false;
  }
};

// 关闭评价模态框
const closeEvaluationModal = () => {
  showEvaluationModalVisible.value = false;
  selectedRecruit.value = null;
  evaluations.value = [];
};

const clearEvaluationForm = () => {
  evaluationForm.comment = '';
  evaluationForm.department = '';
  evaluationForm.technical_skills = null;
  evaluationForm.communication_skills = null;

  evaluationForm.problem_solving = null;
  evaluationForm.teamwork = null;
  evaluationForm.learning_ability = null;
  evaluationForm.motivation = null;
  evaluationForm.strengths = '';
  evaluationForm.weaknesses = '';
  evaluationForm.result = 'pending';
  evaluationForm.recommended_department = '';
};


const openInterviewModal = async (recruit) => {
  selectedRecruit.value = recruit;
  showInterviewModal.value = true;
  await Promise.all([
    fetchInterviews(recruit.uid),
    fetchInterviewStats()
  ]);
};

// 关闭面试模态框
const closeInterviewModal = () => {
  showInterviewModal.value = false;
  selectedRecruit.value = null;
  interviews.value = [];
};

// 获取面试列表
const fetchInterviews = async (uid) => {
  interviewLoading.value = true;
  try {
    const response = await axios.get(`/interview/interviews/${uid}`);
    interviews.value = response.data;
  } catch (error) {
    console.error('Failed to fetch interviews:', error);
    window.notyf.error('获取面试记录失败');
  } finally {
    interviewLoading.value = false;
  }
};

// 面试相关辅助方法
const getStageLabel = (stage) => {
  const stageMap = {
    'first_round': '一面',
    'second_round': '二面',
    'completed': '已完成'
  };
  return stageMap[stage] || stage;
};

const getInterviewFormatLabel = (format) => {
  const formatLabels = {
    'one_to_one': '一对一',
    'one_to_many': '一对多',
    'many_to_many': '多对多'
  };
  return formatLabels[format] || '一对一';
};

const getResultLabel = (result) => {
  const resultMap = {
    'pass': '通过',
    'fail': '未通过',
    'pending': '待定',
    'recommended': '推荐'
  };
  return resultMap[result] || result;
};

const getResultClass = (result) => {
  const classMap = {
    'pass': 'result-pass',
    'fail': 'result-fail',
    'pending': 'result-pending',
    'recommended': 'result-recommended'
  };
  return classMap[result] || '';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 面试表单相关方法
const resetInterviewForm = () => {
  Object.assign(interviewForm, {
    stage: 'first_round',
    interview_date: new Date().toISOString().slice(0, 16),
    interview_format: 'one_to_one',
    interview_duration: null,
    technical_skills: null,
    communication_skills: null,
    problem_solving: null,
    teamwork: null,
    learning_ability: null,
    motivation: null,
    result: 'pending',
    strengths: '',
    weaknesses: '',
    technical_questions: '',
    behavioral_questions: '',
    additional_notes: '',
    recommended_department: ''
  });
  editingInterview.value = null;
};

const showAddInterviewForm = () => {
  resetInterviewForm();
  showInterviewForm.value = true;
};

const showEditInterviewForm = (interview) => {
  editingInterview.value = interview;
  Object.assign(interviewForm, {
    stage: interview.stage,
    interview_date: new Date(interview.interview_date).toISOString().slice(0, 16),
    interview_completed: interview.interview_completed,
    interview_duration: interview.interview_duration,
    technical_skills: interview.technical_skills,
    communication_skills: interview.communication_skills,
    problem_solving: interview.problem_solving,
    teamwork: interview.teamwork,
    learning_ability: interview.learning_ability,
    motivation: interview.motivation,
    result: interview.result,
    strengths: interview.strengths || '',
    weaknesses: interview.weaknesses || '',
    technical_questions: interview.technical_questions || '',
    behavioral_questions: interview.behavioral_questions || '',
    additional_notes: interview.additional_notes || '',
    recommended_department: interview.recommended_department || ''
  });
  showInterviewForm.value = true;
};

const submitInterviewForm = async () => {
  try {
    const formData = {
      ...interviewForm,
      uid: selectedRecruit.value.uid,
      interview_date: new Date(interviewForm.interview_date).toISOString()
    };
    
    if (editingInterview.value) {
      // 更新面试记录
      await axios.put(`/interview/interviews/${editingInterview.value.id}`, formData);
      window.notyf.success('面试记录更新成功');
    } else {
      // 创建面试记录
      await axios.post('/interview/interviews', formData);
      window.notyf.success('面试记录创建成功');
    }
    
    showInterviewForm.value = false;
    await fetchInterviews(selectedRecruit.value.uid);
  } catch (error) {
    console.error('Submit interview form failed:', error);
    window.notyf.error('操作失败：' + (error.response?.data?.detail || error.message));
  }
};

const deleteInterview = async (interview) => {
  confirm.require({
    message: `确定要删除这条面试记录吗？此操作不可恢复！`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`/interview/interviews/${interview.id}`);
        window.notyf.success('面试记录删除成功');
        await fetchInterviews(selectedRecruit.value.uid);
      } catch (error) {
        console.error('Delete interview failed:', error);
        window.notyf.error('删除失败：' + (error.response?.data?.detail || error.message));
      }
    }
  });
};

// 获取面试统计
const fetchInterviewStats = async () => {
  statsLoading.value = true;
  try {
    const response = await axios.get('/interview/interview_stats');
    interviewStats.value = response.data;
  } catch (error) {
    console.error('Failed to fetch interview stats:', error);
    window.notyf.error('获取面试统计失败');
  } finally {
    statsLoading.value = false;
  }
};

// 发送面试通知
const sendInterviewNotification = async (interview) => {
  try {
    const notificationData = {
      uid: interview.uid,
      stage: interview.stage,
      interview_date: interview.interview_date,
      location: '待定',
      notes: '请准备相关材料，准时参加面试'
    };
    
    await axios.post('/interview/send_interview_notification', notificationData);
    window.notyf.success('面试通知发送成功');
  } catch (error) {
    console.error('Send notification failed:', error);
    window.notyf.error('发送通知失败：' + (error.response?.data?.detail || error.message));
  }
};

// 添加评价
const addEvaluation = async () => {
  if (!selectedRecruit.value || !evaluationForm.comment.trim()) {
    window.notyf.error('请输入评价意见');
    return;
  }
  
  try {
    await axios.post('/recruit/add_evaluation', {
      uid: selectedRecruit.value.uid,
      comment: evaluationForm.comment.trim(),
      department: evaluationForm.department,
      // 评分项目
      technical_skills: evaluationForm.technical_skills,
      communication_skills: evaluationForm.communication_skills,
      problem_solving: evaluationForm.problem_solving,
      teamwork: evaluationForm.teamwork,
      learning_ability: evaluationForm.learning_ability,
      motivation: evaluationForm.motivation,
      // 总体评价
      strengths: evaluationForm.strengths,
      weaknesses: evaluationForm.weaknesses,
      // 评价结果
      result: evaluationForm.result,
      // 推荐部门
      recommended_department: evaluationForm.recommended_department
    });
    
    // 刷新评价列表
    await fetchEvaluations(selectedRecruit.value.uid);
    // 清空表单
    clearEvaluationForm();
    window.notyf.success('评价添加成功');
  } catch (error) {
    console.error('Add evaluation failed:', error);
    window.notyf.error('评价添加失败');
  }
};

const updateStatus = async (status) => {
  if (!selectedRecruit.value) return;
  
  // 检查状态是否被锁定
  if (isStatusLocked.value) {
    window.notyf.error('状态已锁定，无法修改');
    return;
  }
  
  // 如果是通过状态，检查前置条件
  if (status === 'accepted') {
    if (!selectedRecruit.value.first_round_passed || !selectedRecruit.value.second_round_passed) {
      window.notyf.error('必须先通过一面和二面才能最终通过');
      return;
    }
    
    if (!selectedRecruit.value.assigned_department) {
      window.notyf.error('必须先分配部门才能最终通过');
      return;
    }
    
    // 确认录取并发送通知
    confirm.require({
      message: `确定要录取 ${selectedRecruit.value.name}（学号：${selectedRecruit.value.uid}）吗？\n\n录取后将通过钉钉OA发送录取通知。\n\n注意：录取后状态将被锁定，无法修改！`,
      header: '确认录取',
      icon: 'pi pi-check-circle',
      acceptClass: 'p-button-success',
      accept: async () => {
        try {
          const response = await axios.post('/recruit/final-accept', {
            uid: selectedRecruit.value.uid,
            department: selectedRecruit.value.assigned_department
          });
          
          if (response.data.success) {
            window.notyf.success('录取成功！录取通知已通过钉钉OA发送');
            // 刷新数据
            await fetchRecruits();
            await fetchRecruitDetail(selectedRecruit.value.uid);
          } else {
            window.notyf.error('录取失败：' + response.data.message);
          }
        } catch (error) {
          console.error('Final accept failed:', error);
          window.notyf.error('录取失败：' + (error.response?.data?.detail || error.message));
        }
      }
    });
    return;
  }
  
  // 如果是拒绝状态，添加确认
  if (status === 'rejected') {
    confirm.require({
      message: `确定要拒绝 ${selectedRecruit.value.name}（学号：${selectedRecruit.value.uid}）吗？\n\n拒绝后状态将被锁定，无法修改！\n\n系统将根据当前面试阶段发送相应的拒绝通知。`,
      header: '确认拒绝',
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          const response = await axios.post('/recruit/final-reject', {
            uid: selectedRecruit.value.uid,
            department: selectedRecruit.value.assigned_department || ''
          });
          
          if (response.data.success) {
            window.notyf.success(response.data.message);
            // 刷新列表和详情
            await fetchRecruits();
            await fetchRecruitDetail(selectedRecruit.value.uid);
          } else {
            window.notyf.error('拒绝失败：' + response.data.message);
          }
        } catch (error) {
          console.error('Reject failed:', error);
          window.notyf.error('拒绝失败：' + (error.response?.data?.detail || error.message));
        }
      }
    });
    return;
  }
  
  try {
    await axios.post('/recruit/batch_update_status', {
      uids: [selectedRecruit.value.uid],
      status
    });
    
    // 刷新列表和详情
    await fetchRecruits();
    await fetchRecruitDetail(selectedRecruit.value.uid);
    window.notyf.success('状态更新成功');
  } catch (error) {
    console.error('Status update failed:', error);
    window.notyf.error('状态更新失败');
  }
};

// 分配部门
const assignDepartment = async (department) => {
  if (!selectedRecruit.value) return;
  
  // 检查是否已录取（录取后不能修改部门）
  if (selectedRecruit.value.is_admitted) {
    window.notyf.error('已录取的候选人不能修改部门分配');
    return;
  }
  
  // 检查是否通过一面和二面
  if (!selectedRecruit.value.first_round_passed || !selectedRecruit.value.second_round_passed) {
    window.notyf.error('必须先通过一面和二面才能分配部门');
    return;
  }
  
  try {
    await axios.post('/recruit/assign_department', {
      uid: selectedRecruit.value.uid,
      department
    });
    
    // 刷新列表和详情
    await fetchRecruits();
    await fetchRecruitDetail(selectedRecruit.value.uid);
    window.notyf.success('部门分配成功');
  } catch (error) {
    console.error('Department assignment failed:', error);
    window.notyf.error('部门分配失败');
  }
};

// 删除纳新记录
const deleteRecruit = async (recruit) => {
  confirm.require({
    message: `确定要删除 ${recruit.name}（学号：${recruit.uid}）的纳新记录吗？此操作不可恢复！`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.post('/recruit/delete_recruit', {
          uid: recruit.uid
        });
        
        // 刷新列表
        await fetchRecruits();
        window.notyf.success('纳新记录删除成功');
      } catch (error) {
        console.error('Delete recruit failed:', error);
        window.notyf.error('删除失败：' + (error.response?.data?.detail || error.message));
      }
    }
  });
};

// 分页处理
const handlePageChange = (event) => {
  currentPage.value = event.page + 1;
  pageSize.value = event.rows;
  fetchRecruits();
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }

  currentPage.value = 1;
  fetchRecruits();
};

const getSortIconClass = (field) => {
  if (sortField.value !== field) {
    return 'pi-sort-alt';
  }

  return sortOrder.value === 'asc' ? 'pi-angle-up' : 'pi-angle-down';
};

// 监听筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1;
  fetchRecruits();
};

// 页面加载时获取数据
onMounted(() => {
  fetchRecruits();
  fetchInterviewTimeSlots();
});

// CsaAdminRecruit.vue - <script setup> 块的底部

// ... (所有函数定义，包括 fetchDeadline, handleSetDeadline, fetchRecruits)

onMounted(async () => {
    await fetchDeadline(); 
    
    await fetchRecruits(); 
});
</script>

<template>
  <div class="admin-recruit-container">    
    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>姓名:</label>
          <input v-model="filters.name" @input="handleFilterChange" @change="handleFilterChange" placeholder="搜索姓名">
        </div>
        <div class="filter-item">
          <label>学号:</label>
          <input v-model="filters.uid" @input="handleFilterChange" @change="handleFilterChange" placeholder="搜索学号">
        </div>
        <div class="filter-item">
          <label>学位:</label>
          <AdminFilterSelect
            v-model="degreeFilterValue"
            :options="degreeFilterOptions"
            optionLabel="label"
            optionValue="value"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-item">
          <label>年级:</label>
          <AdminFilterSelect
            v-model="gradeFilterValue"
            :options="gradeFilterOptions"
            optionLabel="label"
            optionValue="value"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-item">
          <label>表单截止日期:</label>
          <AdminDateField
            v-model="newDeadline"
            @update:modelValue="handleSetDeadline"
          />
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-item">
          <label>专业:</label>
          <input v-model="filters.major_name" @input="handleFilterChange" placeholder="搜索专业">
        </div>
        <div class="filter-item">
          <label>状态:</label>
          <AdminFilterSelect
            v-model="filters.status"
            :options="interviewStatusOptions"
            optionLabel="label"
            optionValue="value"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-item">
          <label>部门:</label>
          <AdminFilterSelect
            v-model="filters.department"
            :options="departmentOptions"
            optionLabel="label"
            optionValue="value"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-item">
          <label>面试基准日期:</label>
          <AdminDateField
            v-model="interviewBaseDate"
            @update:modelValue="handleBaseDateChange"
          />
        </div>
        <div class="filter-item">
          <label>已排班时间段:</label>
          <AdminFilterSelect
            v-model="interviewTimeSlotFilterValue"
            :options="interviewTimeSlotOptions"
            optionLabel="label"
            optionValue="value"
            @change="handleFilterChange"
          />
        </div>
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions">
      <Button
        label="导出数据"
        class="recruit-batch-action recruit-batch-action--export"
        @click="showExportOptions"
      ></Button>
      <Button
        label="批量删除"
        class="recruit-batch-action recruit-batch-action--delete"
        @click="batchDeleteRecruits()"
      ></Button>
      <!-- <button @click="deleteAllRecruits()" class="batch-button delete-all">全部删除</button> -->
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <table class="recruit-table">
        <thead>
          <tr>
            <th><input type="checkbox" @change="selectAll" v-model="selectAllRecruits"></th>
            <th class="col-name">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'name' }" @click="toggleSort('name')">
                <span>姓名</span>
                <i class="pi sort-indicator" :class="getSortIconClass('name')"></i>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'uid' }" @click="toggleSort('uid')">
                <span>学号</span>
                <i class="pi sort-indicator" :class="getSortIconClass('uid')"></i>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'render' }" @click="toggleSort('render')">
                <span>性别</span>
                <i class="pi sort-indicator" :class="getSortIconClass('render')"></i>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'degree' }" @click="toggleSort('degree')">
                <span>学位</span>
                <i class="pi sort-indicator" :class="getSortIconClass('degree')"></i>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'grade' }" @click="toggleSort('grade')">
                <span>年级</span>
                <i class="pi sort-indicator" :class="getSortIconClass('grade')"></i>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'major_name' }" @click="toggleSort('major_name')">
                <span>专业</span>
                <i class="pi sort-indicator" :class="getSortIconClass('major_name')"></i>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'college_name' }" @click="toggleSort('college_name')">
                <span>学院</span>
                <i class="pi sort-indicator" :class="getSortIconClass('college_name')"></i>
              </button>
            </th>
            <th class="col-department-preference">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'department_preference' }" @click="toggleSort('department_preference')">
                <span>部门意愿</span>
                <i class="pi sort-indicator" :class="getSortIconClass('department_preference')"></i>
              </button>
            </th>
            <th class="col-assigned-department">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'assigned_department' }" @click="toggleSort('assigned_department')">
                <span>分配部门</span>
                <i class="pi sort-indicator" :class="getSortIconClass('assigned_department')"></i>
              </button>
            </th>
            <th class="col-status">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'status' }" @click="toggleSort('status')">
                <span>状态</span>
                <i class="pi sort-indicator" :class="getSortIconClass('status')"></i>
              </button>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="recruit in recruits" :key="recruit.uid" :class="{ selected: recruit.selected }">
            <td>
              <input type="checkbox" v-model="recruit.selected">
            </td>
            <td class="col-name">{{ recruit.name }}</td>
            <td>{{ recruit.uid }}</td>
            <td>{{ recruit.render ? '女' : '男' }}</td>
            <td>{{ getDegreeLabel(recruit.degree) }}</td>
            <td>{{ recruit.grade }}级</td>
            <td>{{ recruit.major_name }}</td>
            <td>{{ recruit.college_name }}</td>
            <td class="col-department-preference">
              <div class="department-order">
                <span v-for="dept in getDepartmentOrder(recruit)" :key="dept.id" class="dept-tag">
                  {{ dept.name }}
                </span>
              </div>
            </td>
            <td class="col-assigned-department">
              <span class="department-tag" :style="getDepartmentStyle(recruit.assigned_department)">
                {{ getDepartmentLabel(recruit.assigned_department) }}
              </span>
            </td>
            <td class="col-status">
              <span class="status-tag" :style="getStatusStyle(calculateInterviewStatus(recruit))">
                {{ calculateInterviewStatus(recruit) }}
              </span>
            </td>
            <td>
              <div class="recruit-row-actions">
                <button
                  type="button"
                  @click="viewDetails(recruit)"
                  class="recruit-row-action recruit-row-action--view"
                  title="查看详情"
                  aria-label="查看详情"
                >
                  <i class="pi pi-eye"></i>
                </button>
                <button
                  type="button"
                  @click="deleteRecruit(recruit)"
                  class="recruit-row-action recruit-row-action--delete"
                  title="删除"
                  aria-label="删除"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <Paginator
        :first="first"
        :rows="pageSize"
        :totalRecords="total"
        :rowsPerPageOptions="[10, 20, 30]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="handlePageChange"
      ></Paginator>
    </div>

    <!-- 评价抽屉 -->
    <div v-if="showEvaluationModalVisible" class="drawer-overlay" @click="closeEvaluationModal">
      <div class="drawer-content evaluation-drawer recruit-evaluation-drawer" @click.stop style="width: 1200px !important; max-width: 95vw !important;">
        <div class="drawer-header">
          <h3>评价纳新者 - {{ selectedRecruit?.name }}</h3>
          <button @click="closeEvaluationModal" class="close-btn">&times;</button>
        </div>
        <div class="evaluation-content">
          <!-- 左侧：候选人详细信息 -->
          <div class="candidate-info-panel">
            <h4>候选人信息</h4>
            <div class="info-section" v-if="selectedRecruit">
              <!-- 基本信息 -->
              <div class="info-group">
                <h5>基本信息</h5>
                <div class="info-grid">
                  <div class="info-item">
                    <label>姓名:</label>
                    <span>{{ selectedRecruit.name }}</span>
                  </div>
                  <div class="info-item">
                    <label>学号:</label>
                    <span>{{ selectedRecruit.uid }}</span>
                  </div>
                  <div class="info-item">
                    <label>性别:</label>
                    <span>{{ selectedRecruit.render ? '女' : '男' }}</span>
                  </div>
                  <div class="info-item">
                    <label>学位:</label>
                    <span>{{ getDegreeLabel(selectedRecruit.degree) }}</span>
                  </div>
                  <div class="info-item">
                    <label>年级:</label>
                    <span>{{ selectedRecruit.grade }}级</span>
                  </div>
                  <div class="info-item">
                    <label>专业:</label>
                    <span>{{ selectedRecruit.major_name }}</span>
                  </div>
                  <div class="info-item">
                    <label>学院:</label>
                    <span>{{ selectedRecruit.college_name }}</span>
                  </div>
                  <div class="info-item">
                    <label>联系电话:</label>
                    <span>{{ selectedRecruit.phone }}</span>
                  </div>
                  <div class="info-item">
                    <label>当前状态:</label>
                                  <span class="status-tag" :style="getStatusStyle(calculateInterviewStatus(selectedRecruit))">
                {{ calculateInterviewStatus(selectedRecruit) }}
              </span>
                  </div>
                </div>
              </div>

              <!-- 部门意愿 -->
              <div class="info-group">
                <h5>部门意愿排序</h5>
                <div class="department-preference">
                  <div v-for="(dept, index) in getDepartmentOrder(selectedRecruit)" :key="dept.id" class="preference-item">
                    <span class="preference-rank">{{ index + 1 }}</span>
                    <span class="preference-name">{{ dept.name }}</span>
                    <span class="preference-score">意愿度: {{ dept.score }}</span>
                  </div>
                </div>
              </div>

              <!-- 其他信息 -->
              <div class="info-group">
                <h5>其他信息</h5>
                <div class="info-grid">
                  <div class="info-item">
                    <label>是否同意调剂:</label>
                    <span>{{ selectedRecruit.if_agree_to_be_reassigned ? '是' : '否' }}</span>
                  </div>
                  <div class="info-item">
                    <label>是否愿意成为会员:</label>
                    <span>{{ selectedRecruit.if_be_member ? '是' : '否' }}</span>
                  </div>
                </div>
              </div>

              <!-- 自我介绍 -->
              <div class="info-group" v-if="selectedRecruit.introduction && selectedRecruit.introduction.trim()">
                <h5>自我介绍</h5>
                <div class="text-content">
                  {{ selectedRecruit.introduction }}
                </div>
              </div>

              <!-- 技能特长 -->
              <div class="info-group" v-if="selectedRecruit.skill && selectedRecruit.skill.trim()">
                <h5>技能特长</h5>
                <div class="text-content">
                  {{ selectedRecruit.skill }}
                </div>
              </div>

              <!-- 面试状态 -->
              <div class="info-group">
                <h5>面试状态</h5>
                <div class="interview-status">
                  <div class="status-item">
                    <label>当前面试阶段:</label>
                    <span class="interview-stage" :class="selectedRecruit.interview_status">
                      {{ getInterviewStageLabel(selectedRecruit.interview_status) }}
                    </span>
                  </div>
                  
                  <!-- 一面状态卡片 -->
                  <div class="interview-round-card">
                    <div class="round-header">
                      <div class="round-title">
                        <i class="pi pi-star-fill round-icon"></i>
                        <span>第一轮面试</span>
                      </div>
                      <div class="round-status-badge" :class="selectedRecruit.first_round_passed ? 'passed' : 'pending'">
                        <i :class="selectedRecruit.first_round_passed ? 'pi pi-check-circle' : 'pi pi-clock'"></i>
                        {{ selectedRecruit.first_round_passed ? '已通过' : '待通过' }}
                      </div>
                    </div>
                    <div class="round-content">
                      <p class="round-description">
                        <span v-if="selectedRecruit.interview_status == 'first_round' && !selectedRecruit.interview_completed">
                          <i class="pi pi-info-circle"></i>
                          一面面试尚未完成，无法通过一面
                        </span>
                        <span v-else-if="selectedRecruit.first_round_passed">
                          候选人已通过第一轮面试，可以进入第二轮面试。
                        </span>
                        <span v-else>
                          候选人已完成第一轮面试，请评估后决定是否通过。
                        </span>
                      </p>
                      <div class="round-actions" v-if="!(selectedRecruit.interview_status == 'first_round' && !selectedRecruit.interview_completed)">
                        <button 
                          v-if="!selectedRecruit.first_round_passed"
                          @click="passInterview('first_round')" 
                          class="round-action-btn pass"
                          title="通过第一轮面试"
                        >
                          <i class="pi pi-check"></i>
                          通过一面
                        </button>

                      </div>
                    </div>
                  </div>

                  <!-- 二面状态卡片 -->
                  <div class="interview-round-card" :class="{ 'disabled': !selectedRecruit.first_round_passed }">
                    <div class="round-header">
                      <div class="round-title">
                        <i class="pi pi-star-fill round-icon"></i>
                        <span>第二轮面试</span>
                      </div>
                      <div class="round-status-badge" :class="selectedRecruit.second_round_passed ? 'passed' : 'pending'">
                        <i :class="selectedRecruit.second_round_passed ? 'pi pi-check-circle' : 'pi pi-clock'"></i>
                        {{ selectedRecruit.second_round_passed ? '已通过' : '待通过' }}
                      </div>
                    </div>
                    <div class="round-content">
                      <p class="round-description">
                        <span v-if="!selectedRecruit.first_round_passed" class="disabled-text">
                          <i class="pi pi-info-circle"></i>
                          需要先通过第一轮面试才能进行第二轮面试
                        </span>
                        <span v-else-if="selectedRecruit.interview_status == 'second_round' && !selectedRecruit.interview_completed">
                          <i class="pi pi-info-circle"></i>
                          二面面试尚未完成，无法通过二面
                        </span>
                        <span v-else-if="selectedRecruit.second_round_passed">
                          候选人已通过第二轮面试，面试流程完成。
                        </span>
                        <span v-else>
                          候选人已完成第二轮面试，请评估后决定是否通过。
                        </span>
                      </p>
                      <div class="round-actions" v-if="!(selectedRecruit.interview_status == 'second_round' && !selectedRecruit.interview_completed)">
                        <button 
                          v-if="selectedRecruit.first_round_passed && !selectedRecruit.second_round_passed"
                          @click="passInterview('second_round')" 
                          class="round-action-btn pass"
                          title="通过第二轮面试"
                        >
                          <i class="pi pi-check"></i>
                          通过二面
                        </button>

                        <span v-else-if="!selectedRecruit.first_round_passed" class="disabled-hint">
                          <i class="pi pi-lock"></i>
                          需先通过一面并完成二面
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 部门分配 -->
              <div class="info-group">
                <h5>部门分配</h5>
                <div class="department-assignment">
                  <div class="current-department">
                    <label>当前分配部门:</label>
                    <span class="department-tag" :style="getDepartmentStyle(selectedRecruit.assigned_department)">
                      {{ getDepartmentLabel(selectedRecruit.assigned_department) }}
                    </span>
                  </div>
                  
                  <!-- 前置条件检查 -->
                  <div v-if="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed" class="prerequisite-warning">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>必须先通过一面和二面才能分配部门</span>
                  </div>
                  <div v-if="selectedRecruit.is_admitted" class="prerequisite-warning">
                    <i class="pi pi-lock"></i>
                    <span>已录取，无法修改部门分配</span>
                  </div>

                  <div v-if="selectedRecruit.evaluation_status === 'rejected'" class="prerequisite-warning">
                    <i class="pi pi-lock"></i>
                    <span>已拒绝，无法修改部门分配</span>
                  </div>
                  
                  <div class="department-buttons" :class="{ 'disabled': !selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || selectedRecruit.is_admitted }">
                    <button @click="assignDepartment('')" class="dept-btn unassigned" :disabled="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || selectedRecruit.is_admitted">取消分配</button>
                    <button @click="assignDepartment('office')" class="dept-btn office" :disabled="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || selectedRecruit.is_admitted">办公室部</button>
                    <button @click="assignDepartment('competition')" class="dept-btn competition" :disabled="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || selectedRecruit.is_admitted">竞赛部</button>
                    <button @click="assignDepartment('research')" class="dept-btn research" :disabled="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || selectedRecruit.is_admitted">科研部</button>
                    <button @click="assignDepartment('activity')" class="dept-btn activity" :disabled="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || selectedRecruit.is_admitted">活动部</button>
                  </div>
                </div>
              </div>

              <div class="info-group">
                <h5>状态管理</h5>
                <div class="status-management">
                  <div v-if="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || !selectedRecruit.assigned_department" class="prerequisite-warning">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>最终通过需要：通过一面 + 通过二面 + 分配部门</span>
                  </div>
                  
                  <div class="status-buttons">
                    <!-- 录取按钮 -->
                    <button 
                      v-if="!selectedRecruit.is_admitted && !isStatusLocked"
                      @click="updateStatus('accepted')" 
                      class="status-btn accept"
                      :disabled="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || !selectedRecruit.assigned_department"
                      :title="!selectedRecruit.first_round_passed || !selectedRecruit.second_round_passed || !selectedRecruit.assigned_department ? '需要先完成所有前置条件' : '录取候选人并发送钉钉通知'"
                    >
                      <i class="pi pi-check-circle"></i>
                      录取
                    </button>
                    <button v-else-if="selectedRecruit.is_admitted" class="status-btn accepted" disabled>
                      <i class="pi pi-check-circle"></i>
                      已录取
                    </button>
                    
                    <!-- 拒绝按钮 -->
                    <button 
                      v-if="!isRejectLocked && !isStatusLocked"
                      @click="updateStatus('rejected')" 
                      class="status-btn reject"
                      :disabled="isRejectLocked"
                      :title="isRejectLocked ? '无法拒绝' : '拒绝候选人'"
                    >
                      <i class="pi pi-times-circle"></i>
                      拒绝
                    </button>
                    <button v-else-if="selectedRecruit.evaluation_status === 'rejected'" class="status-btn rejected" disabled>
                      <i class="pi pi-times-circle"></i>
                      已拒绝
                    </button>
                    
                    <!-- 待定按钮 -->
                    <button 
                      v-if="!isStatusLocked"
                      @click="updateStatus('pending')" 
                      class="status-btn pending"
                      :disabled="selectedRecruit.is_admitted || selectedRecruit.status === 'rejected'"
                      :title="selectedRecruit.is_admitted ? '已录取，无法设为待定' : selectedRecruit.status === 'rejected' ? '已拒绝，无法设为待定' : '设为待定'"
                    >
                      <i class="pi pi-clock"></i>
                      待定
                    </button>
                    <button v-else-if="selectedRecruit.status === 'pending'" class="status-btn pending" disabled>
                      <i class="pi pi-clock"></i>
                      待定中
                    </button>
                  </div>
                  
                  <!-- 状态锁定提示 -->
                  <div v-if="isStatusLocked && !isRejectLocked" class="status-locked-warning">
                    <i class="pi pi-lock"></i>
                    <span>状态已锁定，无法修改</span>
                  </div>
                  <!-- 拒绝按钮锁定提示 -->
                  <div v-if="isRejectLocked && !isStatusLocked" class="status-locked-warning">
                    <i class="pi pi-lock"></i>
                    <span>状态已锁定，无法修改</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：评价表单和历史 -->
          <div class="evaluation-panel">
            <div class="evaluation-form">
              <!-- 评分项目 -->
              <div class="scoring-section">
                <h4>评分项目 (1-10分)</h4>
                <div class="scoring-grid">
                  <div class="form-group">
                    <label>技术能力:</label>
                    <input type="number" v-model="evaluationForm.technical_skills" min="1" max="10" step="0.5" placeholder="1-10分">
                  </div>
                  <div class="form-group">
                    <label>沟通能力:</label>
                    <input type="number" v-model="evaluationForm.communication_skills" min="1" max="10" step="0.5" placeholder="1-10分">
                  </div>
                  <div class="form-group">
                    <label>问题解决能力:</label>
                    <input type="number" v-model="evaluationForm.problem_solving" min="1" max="10" step="0.5" placeholder="1-10分">
                  </div>
                  <div class="form-group">
                    <label>团队协作能力:</label>
                    <input type="number" v-model="evaluationForm.teamwork" min="1" max="10" step="0.5" placeholder="1-10分">
                  </div>
                  <div class="form-group">
                    <label>学习能力:</label>
                    <input type="number" v-model="evaluationForm.learning_ability" min="1" max="10" step="0.5" placeholder="1-10分">
                  </div>
                  <div class="form-group">
                    <label>动机和热情:</label>
                    <input type="number" v-model="evaluationForm.motivation" min="1" max="10" step="0.5" placeholder="1-10分">
                  </div>
                </div>
              </div>

              <!-- 总体评价 -->
              <div class="overall-evaluation">
                <h4>总体评价</h4>
                <div class="form-group">
                  <label>优点:</label>
                  <textarea v-model="evaluationForm.strengths" placeholder="请描述候选人的优点..." rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>不足:</label>
                  <textarea v-model="evaluationForm.weaknesses" placeholder="请描述候选人的不足..." rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>评价意见:</label>
                  <textarea v-model="evaluationForm.comment" placeholder="请输入您的评价意见..." rows="4"></textarea>
                </div>
              </div>

              <!-- 推荐和部门 -->
              <div class="recommendation-section">
                <h4>推荐和部门</h4>
                <div class="form-group">
                  <label>推荐部门:</label>
                  <AdminFilterSelect
                    v-model="evaluationRecommendedDepartmentValue"
                    :options="recommendedDepartmentOptions"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>
                <div class="form-group">
                  <label>评价结果:</label>
                  <AdminFilterSelect
                    v-model="evaluationForm.result"
                    :options="evaluationResultOptions"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>
                <div class="form-group">
                  <label>所属部门:</label>
                  <input v-model="evaluationForm.department" placeholder="请输入您的所属部门（可选）">
                </div>
              </div>

              <div class="form-actions">
                <button @click="addEvaluation" class="submit-btn">添加评价</button>
              </div>
            </div>
            
            <div class="evaluation-list">
              <h4>评价历史</h4>
              <div v-if="evaluationLoading" class="loading">加载中...</div>
              <div v-else-if="evaluations.length === 0" class="no-evaluations">暂无评价</div>
              <div v-else class="evaluation-items">
                <div v-for="evaluation in evaluations" :key="evaluation.id" class="evaluation-item">
                  <div class="evaluation-header">
                    <span class="evaluator-name">{{ evaluation.evaluator_name }}</span>
                    <span class="evaluation-time">{{ evaluation.evaluation_time }}</span>
                    <span v-if="evaluation.department" class="evaluator-department">{{ evaluation.department }}</span>
                    <span v-if="evaluation.result" class="evaluation-result" :class="evaluation.result">
                      {{ getResultLabel(evaluation.result) }}
                    </span>
                  </div>
                
                <!-- 评分展示 -->
                <div v-if="evaluation.technical_skills || evaluation.communication_skills || evaluation.problem_solving || evaluation.teamwork || evaluation.learning_ability || evaluation.motivation" class="evaluation-scores">
                  <h5>评分详情</h5>
                  <div class="scores-grid">
                    <div v-if="evaluation.technical_skills" class="score-item">
                      <span class="score-label">技术能力:</span>
                      <span class="score-value">{{ evaluation.technical_skills }}分</span>
                    </div>
                    <div v-if="evaluation.communication_skills" class="score-item">
                      <span class="score-label">沟通能力:</span>
                      <span class="score-value">{{ evaluation.communication_skills }}分</span>
                    </div>
                    <div v-if="evaluation.problem_solving" class="score-item">
                      <span class="score-label">问题解决:</span>
                      <span class="score-value">{{ evaluation.problem_solving }}分</span>
                    </div>
                    <div v-if="evaluation.teamwork" class="score-item">
                      <span class="score-label">团队协作:</span>
                      <span class="score-value">{{ evaluation.teamwork }}分</span>
                    </div>
                    <div v-if="evaluation.learning_ability" class="score-item">
                      <span class="score-label">学习能力:</span>
                      <span class="score-value">{{ evaluation.learning_ability }}分</span>
                    </div>
                    <div v-if="evaluation.motivation" class="score-item">
                      <span class="score-label">动机热情:</span>
                      <span class="score-value">{{ evaluation.motivation }}分</span>
                    </div>
                  </div>
                  <div v-if="evaluation.overall_score" class="overall-score">
                    <span class="score-label">总体评分:</span>
                    <span class="score-value">{{ evaluation.overall_score.toFixed(1) }}分</span>
                  </div>
                </div>
                
                <!-- 详细评价 -->
                <div v-if="evaluation.strengths || evaluation.weaknesses" class="evaluation-details">
                  <div v-if="evaluation.strengths" class="detail-item">
                    <h6>优点:</h6>
                    <p>{{ evaluation.strengths }}</p>
                  </div>
                  <div v-if="evaluation.weaknesses" class="detail-item">
                    <h6>不足:</h6>
                    <p>{{ evaluation.weaknesses }}</p>
                  </div>
                </div>
                
                <!-- 推荐部门 -->
                <div v-if="evaluation.recommended_department" class="recommended-department">
                  <span class="recommendation-label">推荐部门:</span>
                  <span class="recommendation-value">{{ getDepartmentLabel(evaluation.recommended_department) }}</span>
                </div>
                
                <div class="evaluation-comment">{{ evaluation.evaluation_comment }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- 面试抽屉 -->
    <div v-if="showInterviewModal" class="drawer-overlay" @click="closeInterviewModal">
      <div class="drawer-content interview-drawer" @click.stop>
        <div class="drawer-header">
          <h3>面试管理 - {{ selectedRecruit?.name }}</h3>
          <button @click="closeInterviewModal" class="close-btn">&times;</button>
        </div>
        <div class="interview-content">
          <!-- 面试统计 -->
          <div class="interview-stats" v-if="interviewStats">
            <h4>面试统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">一面</span>
                <span class="stat-value">{{ interviewStats.stage_counts.first_round }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">二面</span>
                <span class="stat-value">{{ interviewStats.stage_counts.second_round }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均评分</span>
                <span class="stat-value">{{ interviewStats.average_overall_score.toFixed(1) }}</span>
              </div>
            </div>
          </div>
          
          <div class="interview-list">
            <div class="list-header">
              <h4>面试记录</h4>
              <button @click="showAddInterviewForm" class="add-btn">添加面试</button>
            </div>
            <div v-if="interviewLoading" class="loading">加载中...</div>
            <div v-else-if="interviews.length === 0" class="no-interviews">暂无面试记录</div>
            <div v-else class="interview-items">
              <div v-for="interview in interviews" :key="interview.id" class="interview-item">
                <div class="interview-header">
                  <span class="interview-stage">{{ getStageLabel(interview.stage) }}</span>
                  <span class="interview-date">{{ formatDate(interview.interview_date) }}</span>
                  <span class="interviewer">{{ interview.interview_completed ? '已完成' : '未完成' }}</span>
                  <span class="interview-result" :class="getResultClass(interview.result)">
                    {{ getResultLabel(interview.result) }}
                  </span>
                </div>
                <div class="interview-scores" v-if="interview.overall_score">
                  <span class="score-label">总体评分: {{ interview.overall_score.toFixed(1) }}/10</span>
                </div>
                <div class="interview-notes" v-if="interview.additional_notes">
                  <strong>备注:</strong> {{ interview.additional_notes }}
                </div>
                <div class="interview-actions">
                  <button @click="showEditInterviewForm(interview)" class="action-btn edit">编辑</button>
                  <button @click="sendInterviewNotification(interview)" class="action-btn notify">通知</button>
                  <button @click="deleteInterview(interview)" class="action-btn delete">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 面试表单模态框 -->
    <div v-if="showInterviewForm" class="modal-overlay" @click="showInterviewForm = false">
      <div class="modal-content interview-form-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingInterview ? '编辑面试记录' : '添加面试记录' }}</h3>
          <button @click="showInterviewForm = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitInterviewForm" class="interview-form">
            <div class="form-row">
              <div class="form-group">
                <label>面试阶段 *</label>
                <AdminFilterSelect
                  v-model="interviewForm.stage"
                  :options="interviewStageOptions"
                  optionLabel="label"
                  optionValue="value"
                />
              </div>
              <div class="form-group">
                <label>面试日期 *</label>
                <input type="datetime-local" v-model="interviewForm.interview_date" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                                  <label>面试完成状态 *</label>
                <AdminFilterSelect
                  v-model="interviewCompletedValue"
                  :options="interviewCompletedOptions"
                  optionLabel="label"
                  optionValue="value"
                />
              </div>
              <div class="form-group">
                <label>面试时长（分钟）</label>
                <input type="number" v-model="interviewForm.interview_duration" min="0">
              </div>
            </div>
            
            <div class="form-section">
              <h5>评分项目（1-10分）</h5>
              <div class="form-row">
                <div class="form-group">
                  <label>技术能力</label>
                  <input type="number" v-model="interviewForm.technical_skills" min="1" max="10" step="0.5">
                </div>
                <div class="form-group">
                  <label>沟通能力</label>
                  <input type="number" v-model="interviewForm.communication_skills" min="1" max="10" step="0.5">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>问题解决能力</label>
                  <input type="number" v-model="interviewForm.problem_solving" min="1" max="10" step="0.5">
                </div>
                <div class="form-group">
                  <label>团队协作能力</label>
                  <input type="number" v-model="interviewForm.teamwork" min="1" max="10" step="0.5">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>学习能力</label>
                  <input type="number" v-model="interviewForm.learning_ability" min="1" max="10" step="0.5">
                </div>
                <div class="form-group">
                  <label>动机和热情</label>
                  <input type="number" v-model="interviewForm.motivation" min="1" max="10" step="0.5">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>面试结果</label>
              <AdminFilterSelect
                v-model="interviewForm.result"
                :options="interviewResultOptions"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div class="form-group">
              <label>推荐部门</label>
              <AdminFilterSelect
                v-model="interviewRecommendedDepartmentValue"
                :options="recommendedDepartmentOptions"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div class="form-group">
              <label>优点</label>
              <textarea v-model="interviewForm.strengths" rows="3" placeholder="请描述候选人的优点..."></textarea>
            </div>
            
            <div class="form-group">
              <label>不足</label>
              <textarea v-model="interviewForm.weaknesses" rows="3" placeholder="请描述候选人的不足..."></textarea>
            </div>
            
            <div class="form-group">
              <label>技术问题及回答</label>
              <textarea v-model="interviewForm.technical_questions" rows="4" placeholder="请记录技术问题及候选人的回答..."></textarea>
            </div>
            
            <div class="form-group">
              <label>行为问题及回答</label>
              <textarea v-model="interviewForm.behavioral_questions" rows="4" placeholder="请记录行为问题及候选人的回答..."></textarea>
            </div>
            
            <div class="form-group">
              <label>其他备注</label>
              <textarea v-model="interviewForm.additional_notes" rows="3" placeholder="其他需要记录的信息..."></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="showInterviewForm = false" class="cancel-btn">取消</button>
              <button type="submit" class="submit-btn">{{ editingInterview ? '更新' : '创建' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>


  </div>

  <!-- 导出选项模态框 -->
  <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>导出选项</h3>
        <button @click="showExportModal = false" class="close-btn">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="export-options">
          <h4>选择要导出的数据</h4>
          
          <div class="option-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.includeBasicInfo">
              <span>基本信息（姓名、学号、性别、学位、年级、专业、学院）</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.includeContact">
              <span>联系方式（手机号）</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.includeDepartmentPreference">
              <span>部门意愿（各部门意愿评分）</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.includeIntroduction">
              <span>自我介绍和特长</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.includeEvaluation">
              <span>评价信息（状态、分配部门、评价意见）</span>
            </label>
          </div>
          
          <div class="format-selection">
            <h4>导出格式</h4>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="exportOptions.exportFormat" value="excel">
                <span>Excel (.xlsx)</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="exportOptions.exportFormat" value="csv">
                <span>CSV (.csv)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="showExportModal = false" class="cancel-btn">取消</button>
        <button @click="exportData" class="confirm-btn">确认导出</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-recruit-container {
  --recruit-filter-control-height: 2.75rem;
  --recruit-filter-button-height: 2.75rem;
  --recruit-btn-export-bg: #4caf50;
  --recruit-btn-export-bg-hover: #439846;
  --recruit-btn-export-border: #4caf50;
  --recruit-btn-export-text: #ffffff;
  --recruit-btn-export-shadow: none;
  --recruit-btn-export-shadow-hover: none;
  --recruit-btn-delete-bg: #ef4444;
  --recruit-btn-delete-bg-hover: #dc3c3c;
  --recruit-btn-delete-border: #ef4444;
  --recruit-btn-delete-text: #ffffff;
  --recruit-btn-delete-shadow: none;
  --recruit-btn-delete-shadow-hover: none;
  --recruit-dept-tag-bg: #e6f1ff;
  --recruit-dept-tag-border: #bfd8ff;
  --recruit-dept-tag-text: #2f73da;
  --recruit-status-default-bg: #f3f4f6;
  --recruit-status-default-text: #64748b;
  --recruit-status-pending-bg: #fff3e0;
  --recruit-status-pending-text: #ff9800;
  --recruit-status-first-bg: #e3f2fd;
  --recruit-status-first-text: #2196f3;
  --recruit-status-second-bg: #f3e5f5;
  --recruit-status-second-text: #9c27b0;
  --recruit-status-admit-bg: #fbe9e7;
  --recruit-status-admit-text: #ff5722;
  --recruit-status-enrolled-bg: #e8f5e8;
  --recruit-status-enrolled-text: #4caf50;
  --recruit-status-rejected-bg: #ffebee;
  --recruit-status-rejected-text: #f44336;
  --recruit-department-empty-bg: #f3f4f6;
  --recruit-department-empty-text: #64748b;
  --recruit-department-office-bg: #e3f2fd;
  --recruit-department-office-text: #1976d2;
  --recruit-department-competition-bg: #e8f5e8;
  --recruit-department-competition-text: #388e3c;
  --recruit-department-research-bg: #fff3e0;
  --recruit-department-research-text: #f57c00;
  --recruit-department-activity-bg: #f3e5f5;
  --recruit-department-activity-text: #7b1fa2;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: var(--bg-secondary);
  color: var(--text-primary);
  min-height: 100vh;
}

.dark .admin-recruit-container {
  --recruit-btn-export-bg: rgba(34, 197, 94, 0.22);
  --recruit-btn-export-bg-hover: rgba(34, 197, 94, 0.3);
  --recruit-btn-export-border: rgba(74, 222, 128, 0.36);
  --recruit-btn-export-text: #baf7cb;
  --recruit-btn-export-shadow: none;
  --recruit-btn-export-shadow-hover: none;
  --recruit-btn-delete-bg: rgba(239, 68, 68, 0.2);
  --recruit-btn-delete-bg-hover: rgba(239, 68, 68, 0.28);
  --recruit-btn-delete-border: rgba(248, 113, 113, 0.34);
  --recruit-btn-delete-text: #ffb0b8;
  --recruit-btn-delete-shadow: none;
  --recruit-btn-delete-shadow-hover: none;
  --recruit-dept-tag-bg: rgba(59, 130, 246, 0.2);
  --recruit-dept-tag-border: rgba(96, 165, 250, 0.34);
  --recruit-dept-tag-text: #a9cbff;
  --recruit-status-default-bg: rgba(148, 163, 184, 0.16);
  --recruit-status-default-text: #cbd5e1;
  --recruit-status-pending-bg: rgba(245, 158, 11, 0.2);
  --recruit-status-pending-text: #ffd18a;
  --recruit-status-first-bg: rgba(59, 130, 246, 0.2);
  --recruit-status-first-text: #a9cbff;
  --recruit-status-second-bg: rgba(168, 85, 247, 0.2);
  --recruit-status-second-text: #d7b6ff;
  --recruit-status-admit-bg: rgba(249, 115, 22, 0.2);
  --recruit-status-admit-text: #ffc08a;
  --recruit-status-enrolled-bg: rgba(34, 197, 94, 0.2);
  --recruit-status-enrolled-text: #baf7cb;
  --recruit-status-rejected-bg: rgba(239, 68, 68, 0.2);
  --recruit-status-rejected-text: #ffb0b8;
  --recruit-department-empty-bg: rgba(148, 163, 184, 0.16);
  --recruit-department-empty-text: #cbd5e1;
  --recruit-department-office-bg: rgba(59, 130, 246, 0.2);
  --recruit-department-office-text: #a9cbff;
  --recruit-department-competition-bg: rgba(34, 197, 94, 0.2);
  --recruit-department-competition-text: #baf7cb;
  --recruit-department-research-bg: rgba(245, 158, 11, 0.2);
  --recruit-department-research-text: #ffd18a;
  --recruit-department-activity-bg: rgba(168, 85, 247, 0.2);
  --recruit-department-activity-text: #d7b6ff;
}

.filter-section {
  background: var(--bg-surface);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  display: flex;
  flex-direction: column;
  flex: 1 1 180px;
  min-width: 180px;
  gap: 0.5rem;
}

.filter-item label {
  font-weight: bold;
  margin-bottom: 0;
}

.filter-item input {
  width: 100%;
  min-height: var(--recruit-filter-control-height);
  padding: 0 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-sizing: border-box;
}

.filter-item :deep(.p-datepicker) {
  width: 100%;
}

.filter-item :deep(.p-datepicker-input) {
  width: 100%;
  min-height: var(--recruit-filter-control-height);
  padding: 0 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-sizing: border-box;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-item :deep(.p-datepicker:not(.p-disabled):hover .p-datepicker-input) {
  border-color: var(--border-color);
}

.filter-item :deep(.p-datepicker.p-focus .p-datepicker-input) {
  border-color: var(--border-color);
  box-shadow: none;
  outline: none;
}

.filter-item :deep(.p-datepicker-input::placeholder) {
  color: var(--text-secondary);
}

.filter-item :deep(.p-select) {
  width: 100%;
  min-height: var(--recruit-filter-control-height);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-item :deep(.p-select:not(.p-disabled):hover) {
  border-color: var(--border-color);
}

.filter-item :deep(.p-select.p-focus) {
  border-color: var(--border-color);
  box-shadow: none;
  outline: none;
}

.filter-item :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(var(--recruit-filter-control-height) - 2px);
  padding: 0 0.875rem;
  color: var(--text-primary);
}

.filter-item :deep(.p-select-label.p-placeholder) {
  color: var(--text-secondary);
}

.filter-item :deep(.p-select-dropdown) {
  width: 2.75rem;
  color: var(--text-secondary);
}

.filter-item :deep(.p-select-dropdown-icon) {
  font-size: 0.85rem;
}

.batch-actions {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

:deep(.recruit-batch-action.p-button) {
  min-height: var(--recruit-filter-button-height, 2.875rem);
  padding: 0 1.2rem !important;
  border-radius: 10px !important;
  border: 1px solid transparent !important;
  font-weight: 600;
  font-size: 0.98rem;
  line-height: 1;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

:deep(.recruit-batch-action .p-button-label),
:deep(.recruit-batch-action .p-button-icon) {
  color: inherit !important;
  font-weight: inherit;
}

:deep(.recruit-batch-action--export.p-button) {
  background: var(--recruit-btn-export-bg) !important;
  color: var(--recruit-btn-export-text) !important;
  border-color: var(--recruit-btn-export-border) !important;
  box-shadow: var(--recruit-btn-export-shadow) !important;
}

:deep(.recruit-batch-action--export.p-button:not(:disabled):hover) {
  background: var(--recruit-btn-export-bg-hover) !important;
  color: var(--recruit-btn-export-text) !important;
  border-color: var(--recruit-btn-export-border) !important;
  box-shadow: var(--recruit-btn-export-shadow-hover) !important;
}

:deep(.recruit-batch-action--delete.p-button) {
  background: var(--recruit-btn-delete-bg) !important;
  color: var(--recruit-btn-delete-text) !important;
  border-color: var(--recruit-btn-delete-border) !important;
  box-shadow: var(--recruit-btn-delete-shadow) !important;
}

:deep(.recruit-batch-action--delete.p-button:not(:disabled):hover) {
  background: var(--recruit-btn-delete-bg-hover) !important;
  color: var(--recruit-btn-delete-text) !important;
  border-color: var(--recruit-btn-delete-border) !important;
  box-shadow: var(--recruit-btn-delete-shadow-hover) !important;
}

.batch-button.delete-all {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  position: relative;
  overflow: hidden;
  border: 2px solid #b71c1c;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
  transition: all 0.3s ease;
}

.batch-button.delete-all:hover {
  background: linear-gradient(135deg, #b71c1c 0%, #8d0000 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.5);
}

.batch-button.delete-all:before {
  content: '⚠️';
  margin-right: 0.5rem;
  font-size: 1rem;
}

.table-container {
  overflow-x: auto;
}

.recruit-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-surface);
  box-shadow: 0 2px 4px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.recruit-table th,
.recruit-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.recruit-table th {
  background: var(--bg-secondary);
  font-weight: bold;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.sort-header {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.32rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.sort-header:hover {
  color: inherit;
}

.sort-header:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
  border-radius: 6px;
}

.sort-header--active {
  color: inherit;
}

.sort-indicator {
  font-size: 0.66rem;
  color: var(--text-secondary);
  opacity: 0.42;
  transform: translateY(1px);
  transition: opacity 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.sort-header:hover .sort-indicator {
  opacity: 0.58;
}

.sort-header--active .sort-indicator {
  color: var(--accent-color);
  opacity: 0.74;
}

.recruit-table th.col-department-preference,
.recruit-table th.col-assigned-department,
.recruit-table th.col-status,
.recruit-table th.col-name,
.recruit-table td.col-department-preference,
.recruit-table td.col-assigned-department,
.recruit-table td.col-status,
.recruit-table td.col-name {
  white-space: nowrap;
}

.recruit-table tr {
  background: var(--bg-surface);
  transition: background 0.3s ease;
}

.recruit-table tr:hover {
  background: var(--bg-secondary);
}

.recruit-table tr.selected {
  background: rgba(102, 126, 234, 0.15);
  border-left: 3px solid var(--accent-color);
}

.department-order {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 7rem;
}

.dept-tag {
  background: var(--recruit-dept-tag-bg);
  color: var(--recruit-dept-tag-text);
  border: 1px solid var(--recruit-dept-tag-border);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.status-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.department-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.recruit-row-actions {
  display: flex;
  gap: 0.45rem;
}

.recruit-row-action {
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.recruit-row-action i {
  font-size: 0.95rem;
}

.recruit-row-action--view {
  background: #eaf2ff;
  color: #2f73da;
  border-color: #bfd8ff;
}

.recruit-row-action--view:hover {
  background: #dceaff;
  color: #275fc1;
  border-color: #a9cbff;
  transform: translateY(-1px);
}

.recruit-row-action--delete {
  background: #ffe8eb;
  color: #cf415e;
  border-color: #f6bcc7;
}

.recruit-row-action--delete:hover {
  background: #ffdce1;
  color: #b7304d;
  border-color: #f0a9b6;
  transform: translateY(-1px);
}

.dark .recruit-row-action--view {
  background: rgba(59, 130, 246, 0.2);
  color: #a9cbff;
  border-color: rgba(96, 165, 250, 0.34);
}

.dark .recruit-row-action--view:hover {
  background: rgba(59, 130, 246, 0.28);
  color: #c3dcff;
  border-color: rgba(96, 165, 250, 0.46);
}

.dark .recruit-row-action--delete {
  background: rgba(239, 68, 68, 0.18);
  color: #ff9aa5;
  border-color: rgba(239, 68, 68, 0.34);
}

.dark .recruit-row-action--delete:hover {
  background: rgba(239, 68, 68, 0.26);
  color: #ffb0b8;
  border-color: rgba(239, 68, 68, 0.46);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

:deep(.p-paginator) {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 10px;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-paginator-page),
:deep(.p-paginator-first),
:deep(.p-paginator-prev),
:deep(.p-paginator-next),
:deep(.p-paginator-last) {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-color);
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-paginator-page:hover),
:deep(.p-paginator-first:hover),
:deep(.p-paginator-prev:hover),
:deep(.p-paginator-next:hover),
:deep(.p-paginator-last:hover) {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

:deep(.p-paginator-page.p-paginator-page-selected) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

:deep(.p-paginator-rpp-dropdown) {
  min-height: 2.5rem;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
}

:deep(.p-paginator-rpp-dropdown:not(.p-disabled):hover) {
  border-color: color-mix(in srgb, var(--border-color) 72%, var(--accent-color) 28%);
}

:deep(.p-paginator-rpp-dropdown.p-focus) {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

:deep(.p-paginator-rpp-dropdown .p-select-label),
:deep(.p-paginator-rpp-dropdown .p-select-dropdown) {
  color: inherit;
}

:deep(.p-paginator-current) {
  color: var(--text-primary);
  font-weight: 600;
  padding: 0 0.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  max-width: 600px;
  border: 1px solid var(--border-color);
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.evaluation-form {
  margin-top: 1rem;
}

.scoring-section,
.overall-evaluation,
.recommendation-section {
  margin-bottom: 25px;
  padding: 20px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 8px;
  border: 1px solid var(--border-color, #e9ecef);
}

.scoring-section h4,
.overall-evaluation h4,
.recommendation-section h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary, #333);
  font-size: 1rem;
  font-weight: 600;
}

.scoring-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-group input[type="number"] {
  width: 100%;
}

/* 评价历史样式 */
.evaluation-scores {
  margin: 15px 0;
  padding: 15px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 6px;
  border: 1px solid var(--border-color, #e9ecef);
}

.evaluation-scores h5 {
  margin: 0 0 10px 0;
  color: var(--text-primary, #333);
  font-size: 0.9rem;
  font-weight: 600;
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.score-label {
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
}

.score-value {
  font-weight: 600;
  color: var(--accent-color, #2196f3);
}

.overall-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid var(--border-color, #e9ecef);
  margin-top: 10px;
}

.overall-score .score-label {
  font-weight: 600;
  color: var(--text-primary, #333);
}

.overall-score .score-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-color, #2196f3);
}

.evaluation-details {
  margin: 15px 0;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-item h6 {
  margin: 0 0 5px 0;
  color: var(--text-primary, #333);
  font-size: 0.9rem;
  font-weight: 600;
}

.detail-item p {
  margin: 0;
  color: var(--text-secondary, #666);
  font-size: 0.85rem;
  line-height: 1.4;
}

.recommended-department {
  margin: 10px 0;
  padding: 8px 12px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 4px;
  display: inline-block;
}

.recommendation-label {
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
  margin-right: 8px;
}

.recommendation-value {
  font-weight: 600;
  color: var(--accent-color, #2196f3);
}

.evaluation-result {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.evaluation-result.pass {
  background: #d4edda;
  color: #155724;
}

.evaluation-result.fail {
  background: #f8d7da;
  color: #721c24;
}

.evaluation-result.pending {
  background: #fff3cd;
  color: #856404;
}

.evaluation-result.recommended {
  background: #d1ecf1;
  color: #0c5460;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group textarea,
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.form-group textarea:focus,
.form-group input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.evaluation-form .form-group :deep(.p-select) {
  width: 100%;
  min-height: 3rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: none;
  transition: all 0.2s ease;
}

.evaluation-form .form-group :deep(.p-select:not(.p-disabled):hover) {
  border-color: #e9ecef;
}

.evaluation-form .form-group :deep(.p-select.p-focus) {
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

.evaluation-form .form-group :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(3rem - 4px);
  padding: 0 0.75rem;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.evaluation-form .form-group :deep(.p-select-label.p-placeholder) {
  color: var(--text-secondary);
}

.evaluation-form .form-group :deep(.p-select-dropdown) {
  width: 2.75rem;
  color: var(--text-secondary);
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.cancel-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

/* 详情抽屉样式 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-content {
  background: white;
  width: 600px;
  max-width: 90vw;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}

/* 纳新评价抽屉特定样式 */
.recruit-evaluation-drawer {
  width: 1200px !important;
  max-width: 95vw !important;
  background: #f0f8ff !important; /* 添加背景色以便调试 */
}

/* 更具体的选择器确保优先级 */
.drawer-overlay .drawer-content.recruit-evaluation-drawer {
  width: 1200px !important;
  max-width: 95vw !important;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 1.5rem;
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.drawer-body {
  padding: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #f44336;
}

.detail-content {
  margin-bottom: 1rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e3f2fd;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
}

.detail-item span {
  color: #333;
}

.department-preference {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
}

.preference-rank {
  background: #2196f3;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.preference-name {
  font-weight: bold;
  color: #333;
  flex: 1;
}

.preference-score {
  color: #666;
  font-size: 0.9rem;
}

.text-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #4caf50;
  line-height: 1.6;
  white-space: pre-wrap;
}

.quick-evaluation {
  margin-top: 1rem;
}

.evaluation-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 100px;
}

.quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.quick-btn.accept {
  background: #4caf50;
}

.quick-btn.accept:hover {
  background: #45a049;
}

.quick-btn.reject {
  background: #f44336;
}

.quick-btn.reject:hover {
  background: #da190b;
}

.quick-btn.pending {
  background: #ff9800;
}

.quick-btn.pending:hover {
  background: #e68900;
}

/* 评价抽屉样式 */
.evaluation-drawer {
  width: 1200px !important;
  max-width: 95vw !important;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}

.evaluation-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

/* 左侧候选人信息面板 */
.candidate-info-panel {
  flex: 0 0 400px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.candidate-info-panel h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-group {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e1e5e9;
}

.info-group h5 {
  margin: 0 0 12px 0;
  color: #555;
  font-size: 0.95rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.info-item label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.info-item span {
  color: #333;
  font-size: 0.9rem;
}

.text-content {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #667eea;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #555;
}

/* 右侧评价面板 */
.evaluation-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 1200px) {
  .evaluation-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .candidate-info-panel {
    flex: none;
    max-height: 300px;
  }
}

.evaluation-form {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-y: auto;
  max-height: 50%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.evaluation-list {
  overflow-y: auto;
  max-height: 50%;
  background: white;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.evaluation-list h4 {
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 3px solid #2196f3;
  padding-bottom: 0.75rem;
  font-size: 1.2rem;
  font-weight: bold;
  position: relative;
}

.evaluation-list h4::before {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #2196f3, #1976d2);
  border-radius: 2px;
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.no-evaluations {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-style: italic;
}

.evaluation-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.evaluation-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  border-left: 4px solid #2196f3;
}

.evaluation-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.evaluation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.evaluator-name {
  font-weight: bold;
  color: #2196f3;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.evaluation-time {
  color: #666;
  font-size: 0.9rem;
}

.evaluator-department {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.evaluation-comment {
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 自定义滚动条样式 */
.evaluation-drawer::-webkit-scrollbar,
.interview-drawer::-webkit-scrollbar {
  width: 8px;
}

.evaluation-drawer::-webkit-scrollbar-track,
.interview-drawer::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.evaluation-drawer::-webkit-scrollbar-thumb,
.interview-drawer::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.evaluation-drawer::-webkit-scrollbar-thumb:hover,
.interview-drawer::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 面试抽屉样式 */
.interview-drawer {
  width: 600px;
  max-width: 90vw;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}

.interview-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

.interview-list {
  flex: 1;
}

.interview-list h4 {
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 3px solid #ff9800;
  padding-bottom: 0.75rem;
  font-size: 1.2rem;
  font-weight: bold;
  position: relative;
}

.interview-list h4::before {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #ff9800, #f57c00);
  border-radius: 2px;
}

.no-interviews {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-style: italic;
}

.interview-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interview-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  border-left: 4px solid #ff9800;
}

.interview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.interview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.interview-stage {
  font-weight: bold;
  color: #ff9800;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.interview-date {
  color: #666;
  font-size: 0.9rem;
}

.interviewer {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.interview-result {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.result-pass {
  background: #e8f5e8;
  color: #2e7d32;
}

.result-fail {
  background: #ffebee;
  color: #c62828;
}

.result-pending {
  background: #fff3e0;
  color: #f57c00;
}

.result-recommended {
  background: #e3f2fd;
  color: #1976d2;
}

.interview-scores {
  margin-top: 0.5rem;
}

.score-label {
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
}

.interview-notes {
  margin-top: 0.5rem;
  color: #333;
  line-height: 1.6;
}

.interview-actions {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.interview-actions h4 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
}

.interview-actions p {
  color: #666;
  font-style: italic;
  margin: 0;
}

/* 面试统计样式 */
.interview-stats {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  margin-bottom: 2rem;
}

.interview-stats h4 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff9800;
}

/* 列表头部样式 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

/* 面试记录操作按钮 */
.interview-item .interview-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.interview-item .action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: white;
  transition: all 0.2s ease;
}

.interview-item .action-btn.edit {
  background: #2196f3;
}

.interview-item .action-btn.edit:hover {
  background: #1976d2;
}

.interview-item .action-btn.notify {
  background: #ff9800;
}

.interview-item .action-btn.notify:hover {
  background: #f57c00;
}

.interview-item .action-btn.delete {
  background: #f44336;
}

.interview-item .action-btn.delete:hover {
  background: #d32f2f;
}

/* 面试表单模态框样式 */
.interview-form-modal {
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.interview-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.form-section h5 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: bold;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.interview-form .form-group :deep(.p-select) {
  width: 100%;
  min-height: 2.875rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.interview-form .form-group :deep(.p-select:not(.p-disabled):hover) {
  border-color: #ddd;
}

.interview-form .form-group :deep(.p-select.p-focus) {
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
  outline: none;
}

.interview-form .form-group :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(2.875rem - 2px);
  padding: 0 0.75rem;
  font-size: 0.9rem;
  color: #333;
}

.interview-form .form-group :deep(.p-select-label.p-placeholder) {
  color: #666;
}

.interview-form .form-group :deep(.p-select-dropdown) {
  width: 2.75rem;
  color: #666;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #ff9800;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #f57c00;
  transform: translateY(-1px);
}

/* 状态管理样式 */
.status-management {
  margin-top: 1rem;
}

.status-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 100px;
}

.status-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.status-btn.accept {
  background: #4caf50;
}

.status-btn.accept:hover {
  background: #45a049;
}

.status-btn.reject {
  background: #f44336;
}

.status-btn.reject:hover {
  background: #da190b;
}

.status-btn.pending {
  background: #ff9800;
}

.status-btn.pending:hover {
  background: #e68900;
}

.status-btn.accepted {
  background: #4caf50;
  opacity: 0.8;
}

.status-btn.accepted:hover {
  background: #45a049;
}

/* 部门分配样式 */
.department-assignment {
  margin-top: 1rem;
}

/* 前置条件警告样式 */
.prerequisite-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border: 1px solid #ffcc80;
  border-radius: 8px;
  color: #ef6c00;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.prerequisite-warning i {
  font-size: 1.1rem;
}

/* 禁用状态的按钮样式 */
.department-buttons.disabled .dept-btn,
.status-buttons .status-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5 !important;
  color: #999 !important;
  border-color: #ddd !important;
}

.department-buttons.disabled .dept-btn:hover,
.status-buttons .status-btn:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

.current-department {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.current-department label {
  font-weight: bold;
  color: #333;
}

.department-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dept-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dept-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.dept-btn.unassigned {
  background: #6c757d;
}

.dept-btn.unassigned:hover {
  background: #5a6268;
}

.dept-btn.office {
  background: #1976d2;
}

.dept-btn.office:hover {
  background: #1565c0;
}

.dept-btn.competition {
  background: #388e3c;
}

.dept-btn.competition:hover {
  background: #2e7d32;
}

.dept-btn.research {
  background: #f57c00;
}

.dept-btn.research:hover {
  background: #ef6c00;
}

.dept-btn.activity {
  background: #7b1fa2;
}

.dept-btn.activity:hover {
  background: #6a1b9a;
}

/* 危险操作区域样式 */
.danger-zone {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.danger-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e53e3e;
  font-weight: bold;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fed7d7;
  border-radius: 6px;
}

.danger-warning i {
  font-size: 1.2rem;
}

.danger-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.danger-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.danger-btn.delete {
  background: #e53e3e;
}

.danger-btn.delete:hover {
  background: #c53030;
}

/* 导出模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 20px 40px var(--shadow-color);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.export-options h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.option-group {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-color);
}

.format-selection {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.radio-label input[type="radio"] {
  width: 16px;

/* 面试状态样式 */
.interview-status {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-item label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 120px;
}

.interview-stage {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.interview-stage.first_round {
  background: #e3f2fd;
  color: #1976d2;
}

.interview-stage.second_round {
  background: #fff3e0;
  color: #f57c00;
}

.interview-stage.completed {
  background: #e8f5e8;
  color: #388e3c;
}

.round-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.round-status.passed {
  background: #e8f5e8;
  color: #388e3c;
}

.round-status.pending {
  background: #fff3e0;
  color: #ff9800;
}

.interview-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-btn.pass {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.pass:hover {
  background: #388e3c;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.action-btn.fail {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.fail:hover {
  background: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

/* 面试轮次卡片样式 */
.interview-round-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.interview-round-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.interview-round-card.disabled {
  opacity: 0.6;
  background: #f8f9fa;
}

.round-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.round-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.round-icon {
  color: #ff9800;
  font-size: 1.2rem;
}

.round-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.round-status-badge.passed {
  background: #e8f5e8;
  color: #388e3c;
}

.round-status-badge.pending {
  background: #fff3e0;
  color: #ff9800;
}

.round-content {
  margin-top: 12px;
}

.round-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.disabled-text {
  color: #999;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
}

.round-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.round-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.round-action-btn.pass {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.round-action-btn.pass:hover {
  background: linear-gradient(135deg, #45a049, #388e3c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.round-action-btn.fail {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.round-action-btn.fail:hover {
  background: linear-gradient(135deg, #d32f2f, #c62828);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.round-status-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.disabled-hint {
  color: #999;
  font-size: 0.85rem;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.status-locked-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 12px;
}

.status-locked-warning i {
  color: #f39c12;
  font-size: 1.1rem;
}

.status-btn.rejected {
  background: #f44336;
  color: white;
  opacity: 0.7;
  cursor: not-allowed;
}

.status-btn.rejected:hover {
  background: #f44336;
  transform: none;
  box-shadow: none;
}
  height: 16px;
  accent-color: var(--accent-color);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: var(--border-color);
}

.confirm-btn {
  padding: 10px 20px;
  border: none;
  background: var(--accent-color);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}
</style>
