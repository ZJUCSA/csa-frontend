<template>
  <div class="admin-member-container">
    <h2>干事管理</h2>

    <!-- 部门分栏 -->
    <div class="department-tabs">
      <button 
        v-for="dept in departments" 
        :key="dept.value"
        @click="currentDepartment = dept.value"
        :class="['tab-btn', { active: currentDepartment === dept.value }]"
      >
        {{ dept.label }}
        <span class="member-count">({{ getDepartmentMemberCount(dept.value) }})</span>
      </button>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>姓名:</label>
          <input v-model="filters.name" @input="handleFilterChange" placeholder="搜索姓名">
        </div>
        <div class="filter-item">
          <label>学号:</label>
          <input v-model="filters.uid" @input="handleFilterChange" placeholder="搜索学号">
        </div>
        <div class="filter-item">
          <label>状态:</label>
          <AdminFilterSelect
            v-model="memberStatusFilterValue"
            :options="memberStatusFilterOptions"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-item">
          <button @click="showAddMemberModal" class="add-btn">
            <i class="pi pi-plus"></i> 添加干事
          </button>
        </div>
      </div>
    </div>

    <!-- 干事列表 -->
    <div class="members-grid">
      <div v-for="member in filteredMembers" :key="member.uid" class="member-card">
        <div class="member-header">
          <div class="member-info">
            <h3 class="member-name">{{ member.name }}</h3>
            <p class="member-uid">{{ member.uid }}</p>
            <div class="member-status">
              <span :class="['status-badge', member.is_active ? 'active' : 'inactive']">
                {{ member.is_active ? '在职' : '离职' }}
              </span>
              <span class="department-badge">{{ getDepartmentLabel(member.department) }}</span>
              <span class="position-badge">{{ member.position }}</span>
            </div>
          </div>
          <div class="member-actions">
            <button @click="viewMemberDetail(member)" class="action-btn view" title="查看详情">
              <i class="pi pi-eye"></i>
            </button>
            <button @click="editMember(member)" class="action-btn edit" title="编辑">
              <i class="pi pi-pencil"></i>
            </button>
            <button @click="deleteMember(member)" class="action-btn delete" title="删除">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="member-details">
          <div class="detail-item">
            <label>专业:</label>
            <span>{{ member.major_name || '未填写' }}</span>
          </div>
          <div class="detail-item">
            <label>年级:</label>
            <span>{{ member.grade }}级</span>
          </div>
          <div class="detail-item">
            <label>电话:</label>
            <span>{{ member.phone || '未填写' }}</span>
          </div>
          <div class="detail-item">
            <label>加入时间:</label>
            <span>{{ formatDate(member.join_date) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1">上一页</button>
      <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages">下一页</button>
    </div>

    <!-- 查看详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>干事详情</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body" v-if="selectedMember">
          <div class="detail-summary">
            <div class="detail-summary-main">
              <h4 class="detail-summary-name">{{ selectedMember.name }}</h4>
              <p class="detail-summary-uid">{{ selectedMember.uid }}</p>
              <div class="detail-summary-badges">
                <span :class="['status-badge', selectedMember.is_active ? 'active' : 'inactive']">
                  {{ selectedMember.is_active ? '在职' : '离职' }}
                </span>
                <span class="department-badge">{{ getDepartmentLabel(selectedMember.department) }}</span>
                <span class="position-badge">{{ selectedMember.position }}</span>
              </div>
            </div>
            <div class="detail-summary-meta">
              <div class="detail-summary-meta-item">
                <span class="detail-summary-meta-label">学院</span>
                <span class="detail-summary-meta-value">{{ selectedMember.college_name || '未填写' }}</span>
              </div>
              <div class="detail-summary-meta-item">
                <span class="detail-summary-meta-label">专业</span>
                <span class="detail-summary-meta-value">{{ selectedMember.major_name || '未填写' }}</span>
              </div>
              <div class="detail-summary-meta-item">
                <span class="detail-summary-meta-label">年级</span>
                <span class="detail-summary-meta-value">{{ selectedMember.grade ? selectedMember.grade + '级' : '未填写' }}</span>
              </div>
            </div>
          </div>
          <div class="detail-section detail-section-basic">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>姓名:</label>
                <span>{{ selectedMember.name }}</span>
              </div>
              <div class="detail-item">
                <label>学号:</label>
                <span>{{ selectedMember.uid }}</span>
              </div>
              <div class="detail-item">
                <label>性别:</label>
                <span>{{ selectedMember.render ? '女' : '男' }}</span>
              </div>
              <div class="detail-item">
                <label>专业:</label>
                <span>{{ selectedMember.major_name || '未填写' }}</span>
              </div>
              <div class="detail-item">
                <label>学院:</label>
                <span>{{ selectedMember.college_name || '未填写' }}</span>
              </div>
              <div class="detail-item">
                <label>年级:</label>
                <span>{{ selectedMember.grade }}级</span>
              </div>
              <div class="detail-item">
                <label>电话:</label>
                <span>{{ selectedMember.phone || '未填写' }}</span>
              </div>
              <div class="detail-item">
                <label>部门:</label>
                <span>{{ getDepartmentLabel(selectedMember.department) }}</span>
              </div>
              <div class="detail-item">
                <label>职位:</label>
                <span>{{ selectedMember.position }}</span>
              </div>
              <div class="detail-item">
                <label>状态:</label>
                <span :class="['status-badge', selectedMember.is_active ? 'active' : 'inactive']">
                  {{ selectedMember.is_active ? '在职' : '离职' }}
                </span>
              </div>
              <div class="detail-item">
                <label>加入时间:</label>
                <span>{{ formatDate(selectedMember.join_date) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="selectedMember.bank_card || selectedMember.bank_name">
            <h4>财务信息</h4>
            <div class="detail-grid">
              <div class="detail-item" v-if="selectedMember.bank_card">
                <label>银行卡号:</label>
                <span>{{ selectedMember.bank_card }}</span>
              </div>
              <div class="detail-item" v-if="selectedMember.bank_name">
                <label>开户行:</label>
                <span>{{ selectedMember.bank_name }}</span>
              </div>
              <div class="detail-item" v-if="selectedMember.account_holder">
                <label>开户人:</label>
                <span>{{ selectedMember.account_holder }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="selectedMember.work_hours || selectedMember.performance_score">
            <h4>工作信息</h4>
            <div class="detail-grid">
              <div class="detail-item" v-if="selectedMember.work_hours">
                <label>工作时长:</label>
                <span>{{ selectedMember.work_hours }}小时</span>
              </div>
              <div class="detail-item" v-if="selectedMember.performance_score">
                <label>绩效评分:</label>
                <span>{{ selectedMember.performance_score }}分</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="selectedMember.email || selectedMember.wechat || selectedMember.qq">
            <h4>联系方式</h4>
            <div class="detail-grid">
              <div class="detail-item" v-if="selectedMember.email">
                <label>邮箱:</label>
                <span>{{ selectedMember.email }}</span>
              </div>
              <div class="detail-item" v-if="selectedMember.wechat">
                <label>微信:</label>
                <span>{{ selectedMember.wechat }}</span>
              </div>
              <div class="detail-item" v-if="selectedMember.qq">
                <label>QQ:</label>
                <span>{{ selectedMember.qq }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="selectedMember.notes || selectedMember.skills">
            <h4>备注信息</h4>
            <div class="detail-grid">
              <div class="detail-item" v-if="selectedMember.notes">
                <label>备注:</label>
                <span>{{ selectedMember.notes }}</span>
              </div>
              <div class="detail-item" v-if="selectedMember.skills">
                <label>技能特长:</label>
                <span>{{ selectedMember.skills }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">关闭</button>
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>编辑干事信息</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveMember" class="member-form">
            <div class="form-section">
              <h4>基本信息</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>姓名 *</label>
                  <input v-model="memberForm.name" type="text" required>
                </div>
                <div class="form-group">
                  <label>学号 *</label>
                  <input v-model="memberForm.uid" type="text" required>
                </div>
                <div class="form-group">
                  <label>性别</label>
                  <AdminFilterSelect
                    v-model="memberGenderValue"
                    :options="memberGenderOptions"
                  />
                </div>
                <div class="form-group">
                  <label>专业</label>
                  <input v-model="memberForm.major_name" type="text">
                </div>
                <div class="form-group">
                  <label>学院</label>
                  <input v-model="memberForm.college_name" type="text">
                </div>
                <div class="form-group">
                  <label>年级</label>
                  <input v-model="memberForm.grade" type="number" min="1" max="10">
                </div>
                <div class="form-group">
                  <label>电话</label>
                  <input v-model="memberForm.phone" type="text">
                </div>
                <div class="form-group">
                  <label>部门 *</label>
                  <AdminFilterSelect
                    v-model="memberDepartmentValue"
                    :options="memberDepartmentOptions"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>职位</label>
                  <input v-model="memberForm.position" type="text">
                </div>
                <div class="form-group">
                  <label>状态</label>
                  <AdminFilterSelect
                    v-model="memberActiveValue"
                    :options="memberActiveOptions"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>财务信息</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>银行卡号</label>
                  <input v-model="memberForm.bank_card" type="text">
                </div>
                <div class="form-group">
                  <label>开户行</label>
                  <input v-model="memberForm.bank_name" type="text">
                </div>
                <div class="form-group">
                  <label>开户人姓名</label>
                  <input v-model="memberForm.account_holder" type="text">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>工作信息</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>工作时长</label>
                  <input v-model="memberForm.work_hours" type="number" step="0.1" min="0">
                </div>
                <div class="form-group">
                  <label>绩效评分</label>
                  <input v-model="memberForm.performance_score" type="number" step="0.1" min="0" max="100">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>联系方式</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>邮箱</label>
                  <input v-model="memberForm.email" type="email">
                </div>
                <div class="form-group">
                  <label>微信</label>
                  <input v-model="memberForm.wechat" type="text">
                </div>
                <div class="form-group">
                  <label>QQ</label>
                  <input v-model="memberForm.qq" type="text">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>备注信息</h4>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>备注</label>
                  <textarea v-model="memberForm.notes" rows="3"></textarea>
                </div>
                <div class="form-group full-width">
                  <label>技能特长</label>
                  <textarea v-model="memberForm.skills" rows="3"></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">取消</button>
          <button @click="saveMember" class="btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 添加模态框 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>添加干事</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveMember" class="member-form">
            <div class="form-section">
              <h4>基本信息</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>姓名 *</label>
                  <input v-model="memberForm.name" type="text" required>
                </div>
                <div class="form-group">
                  <label>学号 *</label>
                  <input v-model="memberForm.uid" type="text" required>
                </div>
                <div class="form-group">
                  <label>性别</label>
                  <AdminFilterSelect
                    v-model="memberGenderValue"
                    :options="memberGenderOptions"
                  />
                </div>
                <div class="form-group">
                  <label>专业</label>
                  <input v-model="memberForm.major_name" type="text">
                </div>
                <div class="form-group">
                  <label>学院</label>
                  <input v-model="memberForm.college_name" type="text">
                </div>
                <div class="form-group">
                  <label>年级</label>
                  <input v-model="memberForm.grade" type="number" min="1" max="10">
                </div>
                <div class="form-group">
                  <label>电话</label>
                  <input v-model="memberForm.phone" type="text">
                </div>
                <div class="form-group">
                  <label>部门 *</label>
                  <AdminFilterSelect
                    v-model="memberDepartmentValue"
                    :options="memberDepartmentOptions"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>职位</label>
                  <input v-model="memberForm.position" type="text">
                </div>
                <div class="form-group">
                  <label>状态</label>
                  <AdminFilterSelect
                    v-model="memberActiveValue"
                    :options="memberActiveOptions"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>财务信息</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>银行卡号</label>
                  <input v-model="memberForm.bank_card" type="text">
                </div>
                <div class="form-group">
                  <label>开户行</label>
                  <input v-model="memberForm.bank_name" type="text">
                </div>
                <div class="form-group">
                  <label>开户人姓名</label>
                  <input v-model="memberForm.account_holder" type="text">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>工作信息</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>工作时长</label>
                  <input v-model="memberForm.work_hours" type="number" step="0.1" min="0">
                </div>
                <div class="form-group">
                  <label>绩效评分</label>
                  <input v-model="memberForm.performance_score" type="number" step="0.1" min="0" max="100">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>联系方式</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>邮箱</label>
                  <input v-model="memberForm.email" type="email">
                </div>
                <div class="form-group">
                  <label>微信</label>
                  <input v-model="memberForm.wechat" type="text">
                </div>
                <div class="form-group">
                  <label>QQ</label>
                  <input v-model="memberForm.qq" type="text">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>备注信息</h4>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>备注</label>
                  <textarea v-model="memberForm.notes" rows="3"></textarea>
                </div>
                <div class="form-group full-width">
                  <label>技能特长</label>
                  <textarea v-model="memberForm.skills" rows="3"></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">取消</button>
          <button @click="saveMember" class="btn-primary">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import AdminFilterSelect from '@/components/admin/AdminFilterSelect.vue'

const axios = inject('axios');
const confirm = useConfirm();

const members = ref([])
const currentDepartment = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// 筛选条件
const filters = ref({
  name: '',
  uid: '',
  is_active: '',
  position: ''
})

const MEMBER_STATUS_ALL_VALUE = '__all_member_status__'
const MEMBER_GENDER_MALE_VALUE = '__member_gender_male__'
const MEMBER_STATUS_INACTIVE_VALUE = '__member_status_inactive__'
const MEMBER_DEPARTMENT_EMPTY_VALUE = '__member_department_empty__'

const createMappedProxy = (sourceRef, key, rawValue, uiValue) => computed({
  get() {
    return Object.is(sourceRef.value[key], rawValue) ? uiValue : sourceRef.value[key]
  },
  set(value) {
    sourceRef.value[key] = value === uiValue ? rawValue : value
  }
})

// 部门选项
const departments = [
  { value: 'all', label: '全部部门' },
  { value: 'office', label: '办公室部' },
  { value: 'competition', label: '竞赛部' },
  { value: 'research', label: '科研部' },
  { value: 'activity', label: '活动部' }
]

// 计算属性
const memberStatusFilterOptions = [
  { value: MEMBER_STATUS_ALL_VALUE, label: '全部状态' },
  { value: 'true', label: '在职' },
  { value: 'false', label: '离职' }
]

const memberGenderOptions = [
  { value: MEMBER_GENDER_MALE_VALUE, label: '男' },
  { value: true, label: '女' }
]

const memberDepartmentOptions = [
  { value: MEMBER_DEPARTMENT_EMPTY_VALUE, label: '请选择部门' },
  { value: 'office', label: '办公室部' },
  { value: 'competition', label: '竞赛部' },
  { value: 'research', label: '科研部' },
  { value: 'activity', label: '活动部' }
]

const memberActiveOptions = [
  { value: true, label: '在职' },
  { value: MEMBER_STATUS_INACTIVE_VALUE, label: '离职' }
]

const filteredMembers = computed(() => {
  if (!members.value) return []
  
  let filtered = members.value

  // 按部门筛选
  if (currentDepartment.value !== 'all') {
    filtered = filtered.filter(member => member.department === currentDepartment.value)
  }

  // 按姓名筛选
  if (filters.value.name) {
    filtered = filtered.filter(member => 
      member.name.toLowerCase().includes(filters.value.name.toLowerCase())
    )
  }

  // 按学号筛选
  if (filters.value.uid) {
    filtered = filtered.filter(member => 
      member.uid.includes(filters.value.uid)
    )
  }

  // 按状态筛选
  if (filters.value.is_active !== '') {
    filtered = filtered.filter(member => member.is_active === filters.value.is_active)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 方法
const fetchMembers = async () => {
  loading.value = true
  try {
    console.log('Fetching members...')
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    // 只添加非空的筛选条件
    if (filters.value.name) {
      params.name = filters.value.name
    }
    if (filters.value.uid) {
      params.uid = filters.value.uid
    }
    if (filters.value.is_active !== '') {
      params.is_active = filters.value.is_active === 'true' ? true : false
    }
    
    if (currentDepartment.value !== 'all') {
      params.department = currentDepartment.value
    }
    
    console.log('API params:', params)
    const response = await axios.get('/member/members', { params })
    console.log('API response:', response.data)
    members.value = response.data.members || []
    total.value = response.data.total || 0
    console.log('Members loaded:', members.value.length)
  } catch (error) {
    console.error('Failed to fetch members:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    members.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}



const getDepartmentMemberCount = (dept) => {
  if (!members.value || !Array.isArray(members.value)) return 0
  if (dept === 'all') {
    return members.value.length
  }
  return members.value.filter(member => member && member.department === dept).length
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const getDepartmentLabel = (department) => {
  const labels = {
    'office': '办公室部',
    'competition': '竞赛部',
    'research': '科研部',
    'activity': '活动部'
  }
  return labels[department] || department
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchMembers()
}

const changePage = (page) => {
  currentPage.value = page
  fetchMembers()
}

// 模态框状态
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showAddModal = ref(false)
const selectedMember = ref(null)
const memberForm = ref({
  name: '',
  uid: '',
  render: false,
  major_id: '',
  major_name: '',
  college_id: '',
  college_name: '',
  grade: 0,
  phone: '',
  degree: 0,
  department: '',
  position: '干事',
  is_active: true,
  bank_card: '',
  bank_name: '',
  account_holder: '',
  work_hours: 0.0,
  performance_score: 0.0,
  email: '',
  wechat: '',
  qq: '',
  notes: '',
  skills: ''
})

const memberStatusFilterValue = createMappedProxy(filters, 'is_active', '', MEMBER_STATUS_ALL_VALUE)
const memberGenderValue = createMappedProxy(memberForm, 'render', false, MEMBER_GENDER_MALE_VALUE)
const memberDepartmentValue = createMappedProxy(memberForm, 'department', '', MEMBER_DEPARTMENT_EMPTY_VALUE)
const memberActiveValue = createMappedProxy(memberForm, 'is_active', false, MEMBER_STATUS_INACTIVE_VALUE)

const showAddMemberModal = () => {
  // 重置表单
  memberForm.value = {
    name: '',
    uid: '',
    render: false,
    major_id: '',
    major_name: '',
    college_id: '',
    college_name: '',
    grade: 0,
    phone: '',
    degree: 0,
    department: '',
    position: '干事',
    is_active: true,
    bank_card: '',
    bank_name: '',
    account_holder: '',
    work_hours: 0.0,
    performance_score: 0.0,
    email: '',
    wechat: '',
    qq: '',
    notes: '',
    skills: ''
  }
  showAddModal.value = true
}

const viewMemberDetail = (member) => {
  selectedMember.value = member
  showDetailModal.value = true
}

const editMember = (member) => {
  selectedMember.value = member
  // 填充表单数据
  memberForm.value = {
    name: member.name,
    uid: member.uid,
    render: member.render,
    major_id: member.major_id || '',
    major_name: member.major_name || '',
    college_id: member.college_id || '',
    college_name: member.college_name || '',
    grade: member.grade || 0,
    phone: member.phone || '',
    degree: member.degree || 0,
    department: member.department,
    position: member.position || '干事',
    is_active: member.is_active,
    bank_card: member.bank_card || '',
    bank_name: member.bank_name || '',
    account_holder: member.account_holder || '',
    work_hours: member.work_hours || 0.0,
    performance_score: member.performance_score || 0.0,
    email: member.email || '',
    wechat: member.wechat || '',
    qq: member.qq || '',
    notes: member.notes || '',
    skills: member.skills || ''
  }
  showEditModal.value = true
}

const saveMember = async () => {
  try {
    if (showEditModal.value) {
      // 编辑模式
      await axios.put(`/member/members/${selectedMember.value.uid}`, memberForm.value)
      window.notyf.success('干事信息更新成功')
    } else {
      // 添加模式
      await axios.post('/member/members', memberForm.value)
      window.notyf.success('干事添加成功')
    }
    
    // 关闭模态框并刷新数据
    showEditModal.value = false
    showAddModal.value = false
    selectedMember.value = null
    fetchMembers()
  } catch (error) {
    console.error('Save member failed:', error)
    window.notyf.error('保存失败：' + (error.response?.data?.detail || error.message))
  }
}

const closeModal = () => {
  showDetailModal.value = false
  showEditModal.value = false
  showAddModal.value = false
  selectedMember.value = null
}

const deleteMember = async (member) => {
  confirm.require({
    message: `确定要删除干事 ${member.name} 吗？此操作不可恢复！`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`/member/members/${member.uid}`)
        window.notyf.success('干事删除成功')
        fetchMembers()
      } catch (error) {
        console.error('Delete member failed:', error)
        window.notyf.error('删除失败：' + (error.response?.data?.detail || error.message))
      }
    }
  })
}

// 生命周期
onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.admin-member-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  --member-filter-control-height: 3rem;
  --member-form-control-height: 2.875rem;
}

h2 {
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: bold;
}



/* 部门分栏 */
.department-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: var(--accent-color);
  color: white;
}

.tab-btn.active {
  background: var(--accent-color);
  color: white;
  font-weight: 600;
}

.member-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 筛选条件 */
.filter-section {
  background: var(--bg-surface);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-item label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-item input,
.filter-item select {
  min-height: var(--member-filter-control-height);
  padding: 0 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-sizing: border-box;
}

.filter-item :deep(.p-select) {
  width: 100%;
  min-height: var(--member-filter-control-height);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: none;
  transition: all 0.2s ease;
}

.filter-item :deep(.p-select:not(.p-disabled):hover) {
  border-color: var(--border-color);
}

.filter-item :deep(.p-select.p-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  outline: none;
}

.filter-item :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(var(--member-filter-control-height) - 2px);
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

.add-btn {
  min-height: var(--member-filter-control-height);
  padding: 0 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* 干事列表 */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.member-card {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-color);
}

.member-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.member-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-name {
  font-size: 1.35rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.member-uid {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
}

.member-status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.position-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background: var(--primary-color);
  color: white;
}

.department-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.member-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  align-self: flex-start;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn.view {
  background: #2196f3;
  color: white;
}

.action-btn.edit {
  background: #ff9800;
  color: white;
}

.action-btn.delete {
  background: #f44336;
  color: white;
}

.action-btn:hover {
  transform: scale(1.1);
}

.member-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-item span {
  color: var(--text-primary);
  font-size: 0.9rem;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模态框样式 */
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

/* 详情模态框样式 */
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.85rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-grid .detail-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 0.85rem 0.9rem;
  background: var(--bg-hover);
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.detail-grid .detail-item label {
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.78rem;
}

.detail-grid .detail-item span {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.98rem;
  line-height: 1.45;
  word-break: break-word;
}

.detail-grid .detail-item .status-badge {
  align-self: flex-start;
}

.detail-section-basic .detail-item:nth-child(4) {
  order: 8;
}

.detail-section-basic .detail-item:nth-child(5) {
  order: 7;
}

.detail-section-basic .detail-item:nth-child(6) {
  order: 9;
}

.detail-section-basic .detail-item:nth-child(7) {
  order: 10;
}

.detail-section-basic .detail-item:nth-child(8) {
  order: 5;
}

.detail-section-basic .detail-item:nth-child(9) {
  order: 6;
}

.detail-section-basic .detail-item:nth-child(10) {
  order: 4;
}

.detail-summary {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-surface) 100%);
}

.detail-summary-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-summary-name {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.55rem;
  font-weight: 700;
}

.detail-summary-uid {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.detail-summary-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-summary-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.detail-summary-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 0.9rem;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.detail-summary-meta-label {
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
}

.detail-summary-meta-value {
  color: var(--text-primary);
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}

/* 表单样式 */
.member-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.form-section h4 {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-group input,
.form-group select {
  min-height: var(--member-form-control-height);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.member-form .form-group :deep(.p-select) {
  width: 100%;
  min-height: var(--member-form-control-height);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: none;
  transition: all 0.2s ease;
}

.member-form .form-group :deep(.p-select:not(.p-disabled):hover) {
  border-color: var(--border-color);
}

.member-form .form-group :deep(.p-select.p-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  outline: none;
}

.member-form .form-group :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(var(--member-form-control-height) - 2px);
  padding: 0 0.75rem;
  color: var(--text-primary);
}

.member-form .form-group :deep(.p-select-label.p-placeholder) {
  color: var(--text-secondary);
}

.member-form .form-group :deep(.p-select-dropdown) {
  width: 2.75rem;
  color: var(--text-secondary);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-member-container {
    padding: 1rem;
  }
  
  .members-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .department-tabs {
    flex-wrap: wrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .member-header {
    flex-direction: column;
    align-items: stretch;
  }

  .member-actions {
    align-self: flex-start;
  }

  .detail-summary-meta {
    grid-template-columns: 1fr;
  }
  
  .detail-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
