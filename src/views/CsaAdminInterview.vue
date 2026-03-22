<template>
  <div class="interview-admin">
    <div class="page-header">
      <h2>面试排班管理</h2>
      <div class="header-actions">
        <div class="base-time-setting">
          <label>面试基准时间：</label>
          <AdminDateField
            v-model="globalBaseDate"
            class="base-date-field"
            @update:modelValue="updateGlobalBaseDate"
          />
        </div>
        <!-- <button @click="openAutoScheduleModal()" class="auto-schedule-btn">
          <i class="pi pi-magic"></i> 一键排班
        </button>
        <button @click="showScheduleFormModal()" class="add-btn">
          <i class="pi pi-calendar"></i> 安排面试
        </button> -->
        <button @click="refreshData" class="refresh-btn">
          <i class="pi pi-refresh"></i> 刷新
        </button>
      </div>
    </div>



    <!-- 筛选和搜索 -->
    <div class="filter-panel">
      <div class="filter-row">
        <div class="filter-group">
          <label>面试阶段:</label>
          <AdminFilterSelect
            v-model="stageFilterValue"
            :options="stageFilterOptions"
            @change="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label>排班状态:</label>
          <AdminFilterSelect
            v-model="statusFilterValue"
            :options="scheduleStatusFilterOptions"
            @change="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label>搜索学号/姓名:</label>
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="输入学号或姓名搜索"
            @input="applyFilters"
          >
        </div>
      </div>
    </div>

    <!-- 面试记录表格 -->
    <div class="table-container" @wheel="handleHorizontalWheel">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="recruits.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">暂无面试者</div>
        <button @click="refreshData" class="empty-action">刷新数据</button>
      </div>
      <table v-else class="recruits-table">
        <thead>
          <tr>
            <th class="col-uid">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'uid' }" @click="toggleSort('uid')">
                <span>学号</span>
                <i class="pi sort-indicator" :class="getSortIconClass('uid')"></i>
              </button>
            </th>
            <th class="col-name">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'name' }" @click="toggleSort('name')">
                <span>姓名</span>
                <i class="pi sort-indicator" :class="getSortIconClass('name')"></i>
              </button>
            </th>
            <th class="col-major">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'major_name' }" @click="toggleSort('major_name')">
                <span>专业</span>
                <i class="pi sort-indicator" :class="getSortIconClass('major_name')"></i>
              </button>
            </th>
            <th class="col-grade">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'grade' }" @click="toggleSort('grade')">
                <span>年级</span>
                <i class="pi sort-indicator" :class="getSortIconClass('grade')"></i>
              </button>
            </th>
            <th class="col-stage">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'interview_status' }" @click="toggleSort('interview_status')">
                <span>面试阶段</span>
                <i class="pi sort-indicator" :class="getSortIconClass('interview_status')"></i>
              </button>
            </th>
            <th class="col-status">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'schedule_status' }" @click="toggleSort('schedule_status')">
                <span>面试状态</span>
                <i class="pi sort-indicator" :class="getSortIconClass('schedule_status')"></i>
              </button>
            </th>
            <th class="col-interview-time">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'interview_date' }" @click="toggleSort('interview_date')">
                <span>面试时间</span>
                <i class="pi sort-indicator" :class="getSortIconClass('interview_date')"></i>
              </button>
            </th>
            <th class="col-format">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'interviewer' }" @click="toggleSort('interviewer')">
                <span>面试形式</span>
                <i class="pi sort-indicator" :class="getSortIconClass('interviewer')"></i>
              </button>
            </th>
            <th class="col-notification">
              <button type="button" class="sort-header" :class="{ 'sort-header--active': sortField === 'notification_sent' }" @click="toggleSort('notification_sent')">
                <span>是否已通知</span>
                <i class="pi sort-indicator" :class="getSortIconClass('notification_sent')"></i>
              </button>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="recruit in paginatedRecruits" :key="recruit.uid">
            <td class="col-uid">{{ recruit.uid }}</td>
            <td class="col-name">{{ recruit.name }}</td>
            <td class="col-major">{{ recruit.major_name }}</td>
            <td class="col-grade">{{ recruit.grade }}级</td>
            <td class="col-stage">
              <span class="stage-badge" :class="recruit.interview_status">
                {{ getStageLabel(recruit.interview_status) }}
              </span>
            </td>
            <td class="col-status">
              <span class="status-badge" :class="getScheduleStatus(recruit.uid)">
                {{ getStatusLabel(getScheduleStatus(recruit.uid)) }}
              </span>
            </td>
            <td class="col-interview-time">
              <span v-if="getScheduleByUid(recruit.uid)">
                {{ formatDate(getScheduleByUid(recruit.uid).interview_date) }}
              </span>
              <span v-else class="no-schedule">-</span>
            </td>
            <td class="col-format">
              <span v-if="getScheduleByUid(recruit.uid)">
                {{ getScheduleByUid(recruit.uid).interviewer }}
              </span>
              <span v-else class="no-schedule">-</span>
            </td>
            <td class="col-notification">
              <span v-if="getScheduleByUid(recruit.uid)">
                <span v-if="getScheduleByUid(recruit.uid).notification_sent" class="notification-sent">
                  <i class="pi pi-check-circle"></i> 已通知
                </span>
                <span v-else class="notification-pending">
                  <i class="pi pi-clock"></i> 未通知
                </span>
              </span>
              <span v-else class="no-schedule">-</span>
            </td>
            <td class="col-actions">
              <div class="table-action-buttons">
                <button
                  v-if="getScheduleStatus(recruit.uid) === 'pending'"
                  @click="showScheduleFormModal(recruit)"
                  class="table-action-btn table-action-btn--schedule"
                  title="安排面试"
                  aria-label="安排面试"
                >
                  <i class="pi pi-calendar-plus"></i>
                </button>
                <button
                  v-else
                  @click="showEditScheduleForm(getScheduleByUid(recruit.uid))"
                  class="table-action-btn table-action-btn--edit"
                  title="编辑排班"
                  aria-label="编辑排班"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  v-if="getScheduleStatus(recruit.uid) !== 'pending'"
                  @click="deleteSchedule(getScheduleByUid(recruit.uid))"
                  class="table-action-btn table-action-btn--delete"
                  title="删除排班"
                  aria-label="删除排班"
                >
                  <i class="pi pi-trash"></i>
                </button>
                <button
                  v-if="getScheduleStatus(recruit.uid) === 'scheduled'"
                  @click="showNotificationConfirm(getScheduleByUid(recruit.uid))"
                  class="table-action-btn table-action-btn--notify"
                  title="发送通知"
                  aria-label="发送通知"
                >
                  <i class="pi pi-bell"></i>
                </button>
              </div>
            </td>
          </tr>

          <!-- 用空行补齐每页固定行数，避免最后一页行数少导致布局上下跳动 -->
          <tr v-for="n in recruitTableFillerRows" :key="`filler-${n}`" class="recruit-table-filler-row">
            <td colspan="10">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="filteredRecruits.length > 0">
      <Paginator
        :first="first"
        :rows="pageSize"
        :totalRecords="filteredRecruits.length"
        :rowsPerPageOptions="[10, 20, 30]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="handlePageChange"
      ></Paginator>
    </div>

    <!-- 时间段排班统计表格 -->
    <div class="time-slot-stats-table">
      <div class="table-header">
        <h3>时间段排班统计</h3>
        <button @click="refreshTimeSlotStats" class="refresh-btn-small">
          <i class="pi pi-refresh"></i> 刷新
        </button>
      </div>
      <div class="table-container" @wheel="handleHorizontalWheel">
        <table class="time-slot-table">
          <thead>
            <tr>
              <th>时间段</th>
              <th>排班人数</th>
              <th>面试形式</th>
              <th>场地</th>
              <th>面试者列表</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="timeSlot in timeSlotStats" :key="timeSlot.slot" class="time-slot-row">
              <td class="time-slot-cell">
                <div class="time-slot-info">
                  <span class="time-slot-name">{{ timeSlot.slot }}</span>
                  <span class="count-badge">{{ timeSlot.count }}人</span>
                </div>
              </td>
              <td class="count-cell">
                <span class="count-number">{{ timeSlot.count }}</span>
              </td>
                              <td class="interviewer-cell">
                  <div class="interviewer-list">
                    <span v-if="!timeSlot.interview_formats || timeSlot.interview_formats.length === 0" class="no-interviewer">待分配</span>
                    <span v-else v-for="format in timeSlot.interview_formats" :key="format" class="interviewer-tag">
                      {{ getInterviewFormatLabel(format) }}
                    </span>
                  </div>
                </td>
              <td class="venue-cell">
                <div class="venue-list">
                  <span v-if="!timeSlot.venues || timeSlot.venues.length === 0" class="no-venue">待分配</span>
                  <span v-else v-for="venue in timeSlot.venues" :key="venue" class="venue-tag">
                    {{ venue }}
                  </span>
                </div>
              </td>
              <td class="candidates-cell">
                <div class="candidates-list">
                  <div v-if="!timeSlot.scheduled || timeSlot.scheduled.length === 0" class="empty-slot">
                    暂无排班
                  </div>
                  <div v-else class="candidate-item" v-for="person in timeSlot.scheduled" :key="person.uid">
                    <div class="candidate-info">
                      <span class="candidate-name">{{ person.name }}</span>
                      <span class="candidate-uid">({{ person.uid }})</span>
                      <span class="stage-badge" :class="person.stage">{{ getStageLabel(person.stage) }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="action-cell">
                <div class="action-buttons">
                  <button 
                    v-if="timeSlot.count > 0" 
                    @click="completeInterview(timeSlot.slot)" 
                    class="action-btn complete"
                    title="完成面试"
                  >
                    <i class="pi pi-check-circle"></i> 完成面试
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 面试排班表单抽屉 -->
    <div v-if="showScheduleForm" class="drawer-overlay" @click="closeScheduleForm">
      <!-- 左侧时间段排班信息抽屉 -->
      <div v-if="showTimeSlotInfo" class="time-slot-info-drawer" @click.stop>
        <div class="time-slot-info-header">
          <h4>时间段排班信息</h4>
          <button @click="closeTimeSlotInfo" class="close-btn">&times;</button>
        </div>
        <div class="time-slot-info-body">
          <div v-if="selectedTimeSlotInfo" class="time-slot-detail">
            <div class="time-slot-summary">
              <h5>{{ selectedTimeSlotInfo.slot }}</h5>
              <div class="summary-stats">
                <span class="stat-item">
                  <i class="pi pi-users"></i>
                  已排班: {{ selectedTimeSlotInfo.count }}人
                </span>
                <span class="stat-item">
                  <i class="pi pi-user"></i>
                  面试形式: {{ selectedTimeSlotInfo.interview_formats && selectedTimeSlotInfo.interview_formats.length > 0 ? selectedTimeSlotInfo.interview_formats.map(f => getInterviewFormatLabel(f)).join(', ') : '待分配' }}
                </span>
                <span class="stat-item">
                  <i class="pi pi-building"></i>
                  场地: {{ selectedTimeSlotInfo.venues && selectedTimeSlotInfo.venues.length > 0 ? selectedTimeSlotInfo.venues.join(', ') : '待分配' }}
                </span>
              </div>
            </div>
            
            <div class="scheduled-candidates">
              <h6>已排班面试者</h6>
              <div v-if="!selectedTimeSlotInfo.scheduled || selectedTimeSlotInfo.scheduled.length === 0" class="empty-candidates">
                暂无排班
              </div>
              <div v-else class="candidate-list">
                <div v-for="candidate in selectedTimeSlotInfo.scheduled" :key="candidate.uid" class="candidate-card">
                  <div class="candidate-header">
                    <span class="candidate-name">{{ candidate.name }}</span>
                    <span class="candidate-uid">{{ candidate.uid }}</span>
                  </div>
                  <div class="candidate-details">
                    <span class="interviewer">面试形式: {{ getInterviewFormatLabel(candidate.interview_format) || '待分配' }}</span>
                    <span class="stage-badge" :class="candidate.stage">{{ getStageLabel(candidate.stage) }}</span>
                  </div>
                  <div class="candidate-time">
                    <i class="pi pi-calendar"></i>
                    {{ formatDate(candidate.interview_date) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="drawer-content" @click.stop>
        <div class="drawer-header">
          <h3>{{ editingSchedule ? '编辑面试排班' : '添加面试排班' }}</h3>
          <button @click="closeScheduleForm" class="close-btn">&times;</button>
        </div>
        <div class="drawer-body">
          <form @submit.prevent="submitScheduleForm" class="schedule-form">
            <div class="form-row">
              <div class="form-group">
                <label>学号 *</label>
                <input 
                  type="text" 
                  v-model="scheduleForm.uid" 
                  required 
                  :disabled="editingSchedule"
                  placeholder="请输入学号"
                >
              </div>
              <div class="form-group">
                <label>面试阶段 *</label>
                <AdminFilterSelect
                  v-model="scheduleForm.stage"
                  :options="scheduleStageOptions"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>面试开始基准日期 *</label>
                <AdminDateField
                  v-model="scheduleForm.base_date"
                  required
                />
                <small class="form-help">选择面试开始的基准日期，系统将根据此日期计算具体的面试时间</small>
              </div>
              <div class="form-group">
                                  <label>面试形式 *</label>
                <AdminFilterSelect
                  v-model="scheduleForm.interview_format"
                  :options="interviewFormatOptions"
                  required
                />
              </div>
            </div>
            
            <!-- 新增面试排班时显示时间段选择 -->
            <div v-if="!editingSchedule" class="form-group">
              <label>可面试时间段 *</label>
              <div class="time-slot-selector">
                <AdminFilterSelect
                  v-model="scheduleForm.selected_time_slot"
                  class="time-slot-select"
                  :options="availableTimeSlotOptions"
                  placeholder="请选择可面试时间段"
                  @change="onTimeSlotChange"
                  required
                />
                <button 
                  v-if="scheduleForm.selected_time_slot" 
                  type="button" 
                  @click="showTimeSlotInfoDrawer" 
                  class="info-btn"
                  title="查看时间段排班信息"
                >
                  <i class="pi pi-info-circle"></i>
                </button>
              </div>
              <small class="form-help">选择面试者的可面试时间段，系统将自动计算具体的面试日期</small>
            </div>
            
            <!-- 新增面试排班时显示计算后的时间 -->
            <div v-if="!editingSchedule && scheduleForm.selected_time_slot" class="form-group">
              <label>计算后的面试时间</label>
              <input type="text" :value="calculateInterviewDate(scheduleForm.base_date, scheduleForm.selected_time_slot)" readonly>
              <small class="form-help">根据基准日期和选择的时间段自动计算</small>
            </div>
            
            <!-- 编辑面试排班时显示时间段选择 -->
            <div v-if="editingSchedule" class="form-group">
              <label>面试时间段 *</label>
              <div class="time-slot-selector">
                <AdminFilterSelect
                  v-model="scheduleForm.selected_time_slot"
                  class="time-slot-select"
                  :options="editTimeSlotOptions"
                  placeholder="请选择面试时间段"
                  @change="onEditTimeSlotChange"
                  required
                />
                <button 
                  v-if="scheduleForm.selected_time_slot" 
                  type="button" 
                  @click="showEditTimeSlotInfoDrawer" 
                  class="info-btn"
                  title="查看时间段排班信息"
                >
                  <i class="pi pi-info-circle"></i>
                </button>
              </div>
              <small class="form-help">选择面试时间段，系统将根据基准日期计算具体的面试时间</small>
            </div>
            
            <!-- 编辑面试排班时显示计算后的时间 -->
            <div v-if="editingSchedule && scheduleForm.selected_time_slot" class="form-group">
              <label>计算后的面试时间</label>
              <input type="text" :value="calculateInterviewDate(scheduleForm.base_date, scheduleForm.selected_time_slot)" readonly>
              <small class="form-help">根据基准日期和选择的时间段自动计算</small>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>面试时长（分钟）*</label>
                <input type="number" v-model="scheduleForm.interview_duration" min="15" max="120" required>
              </div>
              <div class="form-group">
                <label>排班状态</label>
                <AdminFilterSelect
                  v-model="scheduleForm.status"
                  :options="scheduleStatusOptions"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label>面试地点</label>
              <input type="text" v-model="scheduleForm.location" placeholder="请输入面试地点">
            </div>
            
            <div class="form-group">
              <label>备注</label>
              <textarea v-model="scheduleForm.notes" rows="3" placeholder="面试相关备注信息"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeScheduleForm" class="cancel-btn">取消</button>
              <button type="submit" class="submit-btn">
                {{ editingSchedule ? '更新' : '创建' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 一键排班弹窗 -->
    <div v-if="showAutoScheduleModal" class="modal-overlay" @click="showAutoScheduleModal = false">
      <div class="modal-content auto-schedule-modal" @click.stop>
        <div class="modal-header">
          <h3>一键自动排班</h3>
          <button @click="showAutoScheduleModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="auto-schedule-info">
            <div class="info-section">
              <h4>排班说明</h4>
              <ul>
                <li>系统将自动为所有未排班的面试者安排面试时间</li>
                <li>每个时间段最多安排8人，每个时间段最多使用2个场地</li>
                <li>优先满足面试者的时间段偏好</li>
                <li>自动分配面试场地，确保负载均衡</li>
              </ul>
            </div>
            
            <div class="form-section">
              <div class="form-group">
                <label>基准日期：</label>
                <AdminDateField
                  v-model="autoScheduleForm.base_date"
                  class="form-date-field"
                  required
                />
                <small>用于计算具体的面试日期</small>
              </div>
              
              <div class="form-group">
                <label>每时间段最大人数：</label>
                <input 
                  type="number" 
                  v-model="autoScheduleForm.max_candidates_per_slot" 
                  min="1" 
                  max="10"
                  class="form-input"
                >
                <small>建议设置为8人</small>
              </div>
            </div>
            
            <div class="warning-section">
              <i class="pi pi-exclamation-triangle"></i>
              <span>此操作将为所有未排班的面试者自动安排面试时间，请确认后执行。</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAutoScheduleModal = false" class="cancel-btn">取消</button>
          <button @click="executeAutoSchedule" class="submit-btn" :disabled="autoScheduleLoading">
            <i class="pi pi-magic"></i> 
            {{ autoScheduleLoading ? '排班中...' : '开始排班' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 通知确认弹窗 -->
    <div v-if="showNotificationModal" class="modal-overlay" @click="showNotificationModal = false">
      <div class="modal-content notification-modal" @click.stop>
        <div class="modal-header">
          <h3>确认发送面试通知</h3>
          <button @click="showNotificationModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="notification-info" v-if="currentSchedule">
            <h4>面试信息确认</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>面试者：</label>
                <span>{{ getRecruitName(currentSchedule.uid) }}</span>
              </div>
              <div class="info-item">
                <label>面试阶段：</label>
                <span>{{ getStageLabel(currentSchedule.stage) }}</span>
              </div>
              <div class="info-item">
                <label>面试时间：</label>
                <span>{{ formatDate(currentSchedule.interview_date) }}</span>
              </div>
              <div class="info-item">
                <label>面试形式：</label>
                                    <span>{{ getInterviewFormatLabel(currentSchedule.interview_format) }}</span>
              </div>
              <div class="info-item">
                <label>面试时长：</label>
                <span>{{ currentSchedule.interview_duration }}分钟</span>
              </div>
              <div class="info-item" v-if="currentSchedule.location">
                <label>面试地点：</label>
                <span>{{ currentSchedule.location }}</span>
              </div>
            </div>
            
            <div class="notification-message">
              <label>补充说明：</label>
              <textarea 
                v-model="notificationMessage" 
                rows="3" 
                placeholder="请输入补充说明信息（可选）"
              ></textarea>
            </div>
            
            <div class="notification-warning">
              <i class="pi pi-exclamation-triangle"></i>
              <span>请确认以上面试信息准确无误，确认后将通过钉钉发送通知给面试者。</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showNotificationModal = false" class="cancel-btn">取消</button>
          <button @click="sendScheduleNotification" class="submit-btn">
            <i class="pi pi-send"></i> 确认发送
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, inject } from 'vue';
import AdminDateField from '@/components/admin/AdminDateField.vue';
import { useConfirm } from 'primevue/useconfirm';
import AdminFilterSelect from '@/components/admin/AdminFilterSelect.vue';

const confirm = useConfirm();
const axios = inject('axios');

// 响应式数据
const loading = ref(false);
const schedules = ref([]);
const showScheduleForm = ref(false);
const editingSchedule = ref(null);
const currentPage = ref(1);
const pageSize = ref(10); // 修改为每页10个，更容易看到分页效果
const sortField = ref('');
const sortOrder = ref('asc');
const total = ref(0);

// 筛选条件
const filters = reactive({
  search: '',
  stage: '',
  status: ''
});

const INTERVIEW_STAGE_ALL_VALUE = '__all_interview_stage__';
const INTERVIEW_STATUS_ALL_VALUE = '__all_interview_schedule_status__';

const createMappedProxy = (source, key, rawValue, uiValue) => computed({
  get() {
    return Object.is(source[key], rawValue) ? uiValue : source[key];
  },
  set(value) {
    source[key] = value === uiValue ? rawValue : value;
  }
});

const stageFilterValue = createMappedProxy(filters, 'stage', '', INTERVIEW_STAGE_ALL_VALUE);
const statusFilterValue = createMappedProxy(filters, 'status', '', INTERVIEW_STATUS_ALL_VALUE);

const stageFilterOptions = [
  { value: INTERVIEW_STAGE_ALL_VALUE, label: '全部' },
  { value: 'first_round', label: '一面' },
  { value: 'second_round', label: '二面' }
];

const scheduleStatusFilterOptions = [
  { value: INTERVIEW_STATUS_ALL_VALUE, label: '全部' },
  { value: 'pending', label: '待排班' },
  { value: 'scheduled', label: '已排班' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
];

// 面试者数据
const recruits = ref([]);
const recruitsLoading = ref(false);

// 面试排班表单
const scheduleForm = reactive({
  uid: '',
          stage: 'first_round',
  base_date: '', // 面试开始基准日期，将从全局基准时间获取
  selected_time_slot: '', // 选择的可面试时间段
  interview_date: '', // 计算后的具体面试日期时间
  interview_format: 'many_to_many',
  interview_duration: 45,
  location: '',
  notes: '',
  status: 'scheduled'
});

// 可面试时间选项
const scheduleStageOptions = [
  { value: 'first_round', label: '一面' },
  { value: 'second_round', label: '二面' }
];

const interviewFormatOptions = [
  { value: 'one_to_one', label: '一对一' },
  { value: 'one_to_many', label: '一对多' },
  { value: 'many_to_many', label: '多对多' }
];

const scheduleStatusOptions = [
  { value: 'scheduled', label: '已排班' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
];

const availableTimeSlots = ref([]);
const availableTimeSlotOptions = computed(() => availableTimeSlots.value.map((slot) => ({
  value: slot,
  label: slot,
})));

// 编辑模式的时间段选项
const editTimeSlots = ref([]);
const editTimeSlotOptions = computed(() => editTimeSlots.value.map((slot) => ({
  value: slot,
  label: slot,
})));

// 纳新者信息缓存
const recruitsCache = ref({});

// 通知确认弹窗
const showNotificationModal = ref(false);
const currentSchedule = ref(null);
const notificationMessage = ref('请准备相关材料，准时参加面试');

// 时间段排班统计
const timeSlotStats = ref([]);

// 所有时间段统计（包括空的）
const allTimeSlotStats = ref([]);

// 全局基准时间
const globalBaseDate = ref(new Date().toISOString().slice(0, 10));

// 初始化基准日期
const initializeBaseDate = () => {
  if (!scheduleForm.base_date) {
    scheduleForm.base_date = globalBaseDate.value;
  }
};

// 时间段信息抽屉
const showTimeSlotInfo = ref(false);
const selectedTimeSlotInfo = ref(null);

// 一键排班相关
const showAutoScheduleModal = ref(false);
const autoScheduleLoading = ref(false);
const autoScheduleForm = reactive({
  base_date: new Date().toISOString().slice(0, 10),
  max_candidates_per_slot: 8
});



// 计算属性 - 前端分页
const totalPages = computed(() => Math.ceil(filteredRecruits.value.length / pageSize.value));
const first = computed(() => Math.max(0, (currentPage.value - 1) * pageSize.value));

const filteredRecruits = computed(() => {
  let filtered = recruits.value;
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(recruit => 
      recruit.uid.toLowerCase().includes(search) || 
      recruit.name.toLowerCase().includes(search)
    );
  }
  
  if (filters.stage) {
    filtered = filtered.filter(recruit => recruit.interview_status === filters.stage);
  }
  
  if (filters.status) {
    filtered = filtered.filter(recruit => getScheduleStatus(recruit.uid) === filters.status);
  }
  
  return filtered;
});

const compareSortValues = (left, right) => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left ?? '').localeCompare(String(right ?? ''), 'zh-CN', {
    numeric: true,
    sensitivity: 'base',
  });
};

const getSortableValue = (recruit, field) => {
  const schedule = getScheduleByUid(recruit.uid);
  const scheduleStatus = getScheduleStatus(recruit.uid);

  switch (field) {
    case 'uid':
      return recruit.uid ?? '';
    case 'name':
      return recruit.name ?? '';
    case 'major_name':
      return recruit.major_name ?? '';
    case 'grade':
      return Number.parseInt(recruit.grade, 10) || 0;
    case 'interview_status':
      return {
        first_round: 1,
        second_round: 2,
        completed: 3,
      }[recruit.interview_status] ?? 99;
    case 'schedule_status':
      return {
        pending: 1,
        scheduled: 2,
        completed: 3,
        cancelled: 4,
      }[scheduleStatus] ?? 99;
    case 'interview_date':
      return schedule?.interview_date ? new Date(schedule.interview_date).getTime() : -1;
    case 'interviewer':
      return schedule?.interviewer ?? '';
    case 'notification_sent':
      return schedule?.notification_sent ? 1 : 0;
    default:
      return recruit[field] ?? '';
  }
};

const sortedRecruits = computed(() => {
  if (!sortField.value) {
    return filteredRecruits.value;
  }

  return [...filteredRecruits.value].sort((left, right) => {
    const result = compareSortValues(
      getSortableValue(left, sortField.value),
      getSortableValue(right, sortField.value)
    );

    return sortOrder.value === 'asc' ? result : -result;
  });
});

// 前端分页逻辑
const paginatedRecruits = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return sortedRecruits.value.slice(startIndex, endIndex);
});

// 表格补齐空行：保证每页显示区域高度一致，避免分页时“上下缩放/跳动”
const recruitTableFillerRows = computed(() => {
  const missing = pageSize.value - paginatedRecruits.value.length;
  return missing > 0 ? missing : 0;
});

const resetPagination = () => {
  currentPage.value = 1;
};

const handlePageChange = (event) => {
  currentPage.value = event.page + 1;
  pageSize.value = event.rows;
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }

  currentPage.value = 1;
};

const getSortIconClass = (field) => {
  if (sortField.value !== field) {
    return 'pi-sort-alt';
  }

  return sortOrder.value === 'asc' ? 'pi-angle-up' : 'pi-angle-down';
};

const handleHorizontalWheel = (event) => {
  const container = event.currentTarget;

  if (!(container instanceof HTMLElement)) {
    return;
  }

  const hasHorizontalOverflow = container.scrollWidth > container.clientWidth + 1;
  if (!hasHorizontalOverflow) {
    return;
  }

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (!delta) {
    return;
  }

  event.preventDefault();
  container.scrollLeft += delta;
};

// 方法
const resetScheduleForm = () => {
  Object.assign(scheduleForm, {
    uid: '',
    stage: 'first_round',
    base_date: scheduleForm.base_date || globalBaseDate.value, // 保持当前基准日期，如果没有则使用全局基准日期
    selected_time_slot: '',
    interview_date: '',
    interview_format: 'one_to_one',
    interview_duration: 45,
    location: '',
    notes: '',
    status: 'scheduled'
  });
  editingSchedule.value = null;
  availableTimeSlots.value = [];
};

const openAutoScheduleModal = () => {
  autoScheduleForm.base_date = globalBaseDate.value;
  showAutoScheduleModal.value = true;
};

const executeAutoSchedule = async () => {
  if (!autoScheduleForm.base_date) {
    window.notyf.error('请选择基准日期');
    return;
  }
  
  autoScheduleLoading.value = true;
  
  try {
    const response = await axios.post('/interview/auto-schedule', autoScheduleForm);
    
    if (response.data.success) {
      // 构建详细的结果消息
      let resultMessage = `排班成功！\n\n`;
      resultMessage += `总面试者：${response.data.total_candidates}\n`;
      resultMessage += `成功排班：${response.data.scheduled_candidates}\n`;
      resultMessage += `未排班：${response.data.unscheduled_candidates}\n\n`;
      
      // 添加排班详情
      if (response.data.schedule_details && response.data.schedule_details.length > 0) {
        resultMessage += `排班详情：\n`;
        const details = response.data.schedule_details.slice(0, 10); // 只显示前10个
        details.forEach((detail, index) => {
          resultMessage += `${index + 1}. ${detail.name} (${detail.uid}) - ${detail.display_slot} - ${detail.venue}\n`;
        });
        if (response.data.schedule_details.length > 10) {
          resultMessage += `... 还有 ${response.data.schedule_details.length - 10} 个排班记录\n`;
        }
      }
      
      // 显示成功消息
      window.notyf.success('排班成功！');
      console.log(resultMessage);
      
      // 如果有CSV文件，显示下载提示
      if (response.data.csv_file_path) {
        const csvFilename = response.data.csv_file_path.split('/').pop();
        const downloadConfirmed = confirm(`排班完成！\n\n是否下载面试排班表？\n文件名：${csvFilename}`);
        
        if (downloadConfirmed) {
          // 下载CSV文件
          const downloadUrl = `/api/interview/download-schedule-csv/${csvFilename}`;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = csvFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
      // 关闭弹窗
      showAutoScheduleModal.value = false;
      
      // 刷新数据
      await refreshData();
      await refreshTimeSlotStats();
      
    } else {
      window.notyf.error(`排班失败：${response.data.message}`);
    }
  } catch (error) {
    console.error('Auto schedule error:', error);
    let errorMessage = '排班失败：';
    
    if (error.response?.data?.detail) {
      errorMessage += error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage += error.response.data.message;
    } else if (error.message) {
      errorMessage += error.message;
    } else {
      errorMessage += '未知错误';
    }
    
    window.notyf.error(errorMessage);
  } finally {
    autoScheduleLoading.value = false;
  }
};

const showScheduleFormModal = async (recruit = null) => {
  if (recruit) {
    // 预填充面试者信息
    scheduleForm.uid = recruit.uid;
    
    scheduleForm.stage = recruit.interview_status;
    
    // 保持当前的基准日期，不要重置
    if (!scheduleForm.base_date) {
      scheduleForm.base_date = globalBaseDate.value;
    }
    
    console.log('面试者信息:', recruit);
    console.log('面试者状态:', recruit.interview_status);
    console.log('设置的面试阶段:', scheduleForm.stage);
    
    // 获取该面试者的可面试时间
    try {
      const response = await axios.get(`/interview/recruit_time_slots/${recruit.uid}`);
      availableTimeSlots.value = response.data.formatted_slots || [];
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      availableTimeSlots.value = [];
    }
  } else {
    resetScheduleForm();
  }
  showScheduleForm.value = true;
};

// 时间段选择变化处理
const onTimeSlotChange = () => {
  if (scheduleForm.selected_time_slot) {
    // 自动显示时间段信息抽屉
    showTimeSlotInfoDrawer();
  } else {
    // 清空选择时关闭抽屉
    closeTimeSlotInfo();
  }
};

// 显示时间段信息抽屉
const showTimeSlotInfoDrawer = () => {
  if (!scheduleForm.selected_time_slot) return;
  
  console.log('当前选择的时间段:', scheduleForm.selected_time_slot);
  console.log('时间段统计数据:', timeSlotStats.value);
  
  // 查找对应时间段的排班信息
  const timeSlotInfo = allTimeSlotStats.value.find(stat => {
    // 从时间段显示中提取原始时间段
    const originalSlot = scheduleForm.selected_time_slot; // 格式: "周一 19:00-20:00"
    // 从统计数据的slot中提取时间段部分（去掉日期和周标签）
    // 统计数据的slot格式: "周一 08/22 19:00-20:00 (本周)"
    const statParts = stat.slot.split(' ');
    if (statParts.length >= 3) {
      // 提取周几和时间部分
      const statTimeSlot = `${statParts[0]} ${statParts[2]}`; // "周一 19:00-20:00"
      console.log('比较:', statTimeSlot, '===', originalSlot, '结果:', statTimeSlot === originalSlot);
      return statTimeSlot === originalSlot;
    }
    return false;
  });
  
  console.log('找到的时间段信息:', timeSlotInfo);
  
  if (timeSlotInfo) {
    selectedTimeSlotInfo.value = timeSlotInfo;
    showTimeSlotInfo.value = true;
  } else {
    // 如果没有找到排班信息，创建一个空的
    selectedTimeSlotInfo.value = {
      slot: scheduleForm.selected_time_slot,
      count: 0,
      scheduled: [],
      interview_formats: [],
      venues: []
    };
    showTimeSlotInfo.value = true;
  }
};

// 关闭时间段信息抽屉
const closeTimeSlotInfo = () => {
  showTimeSlotInfo.value = false;
  selectedTimeSlotInfo.value = null;
};

// 编辑模式时间段选择变化处理
const onEditTimeSlotChange = () => {
  if (scheduleForm.selected_time_slot) {
    // 自动显示时间段信息抽屉
    showEditTimeSlotInfoDrawer();
  } else {
    // 清空选择时关闭抽屉
    closeTimeSlotInfo();
  }
};

// 显示编辑模式时间段信息抽屉
const showEditTimeSlotInfoDrawer = () => {
  if (!scheduleForm.selected_time_slot) return;
  
  const timeSlotInfo = allTimeSlotStats.value.find(stat => {
    const originalSlot = scheduleForm.selected_time_slot; // 格式: "周一 19:00-20:00"
    // 统计数据的slot格式: "周一 08/22 19:00-20:00 (本周)"
    const statParts = stat.slot.split(' ');
    if (statParts.length >= 3) {
      // 提取周几和时间部分
      const statTimeSlot = `${statParts[0]} ${statParts[2]}`; // "周一 19:00-20:00"
      return statTimeSlot === originalSlot;
    }
    return false;
  });
  
  if (timeSlotInfo) {
    selectedTimeSlotInfo.value = timeSlotInfo;
    showTimeSlotInfo.value = true;
  } else {
    // 如果没有找到排班信息，创建一个空的
    selectedTimeSlotInfo.value = {
      slot: scheduleForm.selected_time_slot,
      count: 0,
      scheduled: [],
      interview_formats: [],
      venues: []
    };
    showTimeSlotInfo.value = true;
  }
};

// 根据日期计算时间段（使用统一的时间计算逻辑）
const calculateTimeSlotFromDate = (date) => {
  return matchTimeSlotFromDate(date);
};

const showEditScheduleForm = async (schedule) => {
  editingSchedule.value = schedule;

  // initializeBaseDate();
  
  // 将面试时间转换为北京时间
  const interviewDate = new Date(schedule.interview_date);
  const beijingDate = getBeijingDate(interviewDate.toISOString());
  
  // 根据当前面试时间计算对应的时间段
  const currentTimeSlot = calculateTimeSlotFromDate(beijingDate);
  
  Object.assign(scheduleForm, {
    uid: schedule.uid,
    stage: schedule.stage,
    base_date: beijingDate.toISOString().slice(0, 10), // 设置基准日期（北京时间）
    selected_time_slot: currentTimeSlot, // 设置当前的时间段
    interview_date: beijingToISOString(beijingDate), // 使用北京时间
    interview_format: schedule.interview_format,
    interview_duration: schedule.interview_duration,
    location: schedule.location || '',
    notes: schedule.notes || '',
    status: schedule.status
  });
  
  // 获取该面试者的可面试时间
  try {
    const response = await axios.get(`/interview/recruit_time_slots/${schedule.uid}`);
    availableTimeSlots.value = response.data.formatted_slots || [];
    editTimeSlots.value = response.data.formatted_slots || [];
  } catch (error) {
    console.error('Failed to fetch time slots:', error);
    availableTimeSlots.value = [];
    editTimeSlots.value = [];
  }
  
  showScheduleForm.value = true;
};

const closeScheduleForm = () => {
  showScheduleForm.value = false;
  resetScheduleForm();
};

const submitScheduleForm = async () => {
  try {
    let interviewDate;
    
    if (editingSchedule.value) {
      // 编辑模式：根据选择的时间段计算面试时间
      if (!scheduleForm.selected_time_slot) {
        window.notyf.error('请选择面试时间段');
        return;
      }
      const calculatedDate = calculateInterviewDate(scheduleForm.base_date, scheduleForm.selected_time_slot);
      if (!calculatedDate) {
        window.notyf.error('请选择有效的面试时间段');
        return;
      }
      interviewDate = calculatedDate;
    } else {
      // 新增模式：计算具体的面试日期时间（北京时间）
      const calculatedDate = calculateInterviewDate(scheduleForm.base_date, scheduleForm.selected_time_slot);
      if (!calculatedDate) {
        window.notyf.error('请选择有效的面试时间段');
        return;
      }
      interviewDate = calculatedDate;
    }
    
    // 确保发送到后端的时间是北京时间
    const beijingDateTime = new Date(interviewDate);
    const beijingISOString = beijingToISOString(beijingDateTime);
    
    // 只发送后端需要的字段
    const formData = {
      uid: scheduleForm.uid,
      stage: scheduleForm.stage,
      interview_date: beijingISOString,
      interview_format: scheduleForm.interview_format,
      interview_duration: scheduleForm.interview_duration,
      location: scheduleForm.location,
      notes: scheduleForm.notes,
      status: scheduleForm.status
    };
    
    if (editingSchedule.value) {
      await axios.put(`/interview/schedule/${editingSchedule.value.id}`, formData);
      window.notyf.success('面试排班更新成功');
    } else {
      await axios.post('/interview/schedule', formData);
      window.notyf.success('面试排班创建成功');
    }
    
    closeScheduleForm();
    await fetchSchedules();
  } catch (error) {
    console.error('Submit schedule form failed:', error);
    window.notyf.error('操作失败：' + (error.response?.data?.detail || error.message));
  }
};

const deleteSchedule = async (schedule) => {
  // 检查schedule对象是否存在且有id
  if (!schedule || !schedule.id) {
    window.notyf.error('无效的排班记录');
    return;
  }
  
  confirm.require({
    message: `确定要删除这条面试排班吗？此操作不可恢复！`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`/interview/schedule/${schedule.id}`);
        window.notyf.success('面试排班删除成功');
        await fetchSchedules();
      } catch (error) {
        console.error('Delete schedule failed:', error);
        window.notyf.error('删除失败：' + (error.response?.data?.detail || error.message));
      }
    }
  });
};

const showNotificationConfirm = (schedule) => {
  currentSchedule.value = schedule;
  notificationMessage.value = '请准备相关材料，准时参加面试';
  showNotificationModal.value = true;
};

const sendScheduleNotification = async () => {
  if (!currentSchedule.value) return;
  
  try {
    const notificationData = {
      schedule_id: currentSchedule.value.id,
      custom_message: notificationMessage.value
    };
    
    await axios.post('/interview/send_schedule_notification', notificationData);
    window.notyf.success('面试通知发送成功');
    
    // 立即更新本地数据的通知状态
    const scheduleIndex = schedules.value.findIndex(s => s.id === currentSchedule.value.id);
    if (scheduleIndex !== -1) {
      schedules.value[scheduleIndex].notification_sent = true;
    }
    
    // 关闭弹窗并刷新数据
    showNotificationModal.value = false;
    currentSchedule.value = null;
    await fetchSchedules();
  } catch (error) {
    console.error('Send notification failed:', error);
    window.notyf.error('发送通知失败：' + (error.response?.data?.detail || error.message));
  }
};

const fetchRecruits = async () => {
  recruitsLoading.value = true;
  try {
    console.log('开始获取面试者数据...');
    // 面试管理页面需要获取全部数据，使用 all=true 参数
    const response = await axios.get('/recruit/recruits?all=true');
    console.log('面试者数据响应:', response.data);
    recruits.value = response.data.recruits || [];
    console.log(`成功获取 ${recruits.value.length} 个面试者数据`);
    console.log('分页信息:', {
      totalRecruits: recruits.value.length,
      pageSize: pageSize.value,
      totalPages: Math.ceil(recruits.value.length / pageSize.value),
      currentPage: currentPage.value
    });
    
    // 获取每个面试者的时间段信息
    for (const recruit of recruits.value) {
      try {
        const timeSlotsResponse = await axios.get(`/interview/recruit_time_slots/${recruit.uid}`);
        recruit.timeSlots = timeSlotsResponse.data.formatted_slots;
      } catch (error) {
        console.warn(`获取面试者 ${recruit.uid} 的时间段信息失败:`, error);
        recruit.timeSlots = [];
      }
    }
  } catch (error) {
    console.error('获取面试者数据失败:', error);
    console.error('错误详情:', error.response?.data);
    window.notyf.error('获取面试者数据失败: ' + (error.response?.data?.detail || error.message));
  } finally {
    recruitsLoading.value = false;
  }
};

const fetchSchedules = async () => {
  loading.value = true;
  try {
    console.log('开始获取面试排班数据...');
    // 获取所有排班数据，不分页
    const response = await axios.get('/interview/schedule?size=1000');
    console.log('面试排班数据响应:', response.data);
    schedules.value = response.data.schedules || [];
    console.log(`成功获取 ${schedules.value.length} 个面试排班数据`);
    
    // 详细调试信息
    if (schedules.value.length > 0) {
      console.log('排班数据详情:');
      schedules.value.forEach((schedule, index) => {
        console.log(`${index + 1}. UID: ${schedule.uid}, 状态: ${schedule.status}, 日期: ${schedule.interview_date}`);
      });
    } else {
      console.log('警告: 没有获取到任何排班数据');
    }
  } catch (error) {
    console.error('获取面试排班失败:', error);
    console.error('错误详情:', error.response?.data);
    window.notyf.error('获取面试排班失败: ' + (error.response?.data?.detail || error.message));
  } finally {
    loading.value = false;
  }
};



const fetchRecruitsInfo = async () => {
  try {
    const uids = [...new Set(schedules.value.map(s => s.uid))];
    for (const uid of uids) {
      if (!recruitsCache.value[uid]) {
        try {
          const response = await axios.get(`/interview/recruit_info/${uid}`);
          recruitsCache.value[uid] = response.data;
        } catch (error) {
          console.error(`Failed to fetch recruit info for ${uid}:`, error);
          // 如果获取失败，使用默认信息
          recruitsCache.value[uid] = { name: uid, uid: uid };
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch recruits info:', error);
  }
};

const getRecruitName = (uid) => {
  return recruitsCache.value[uid]?.name || uid;
};



const applyFilters = () => {
  resetPagination();
};

const refreshData = async () => {
  console.log('开始刷新数据...');
  try {
    await Promise.all([
      fetchRecruits(),
      fetchSchedules()
    ]);
    console.log('数据刷新完成，开始计算时间段统计...');
    calculateTimeSlotStats();
    console.log('时间段统计计算完成');
  } catch (error) {
    console.error('刷新数据失败:', error);
    window.notyf.error('刷新数据失败，请重试');
  }
};

const calculateTimeSlotStats = () => {
  if (!globalBaseDate.value) return;

  // 定义基础时间段模板
  const baseTimeSlots = [
    { day: 1, times: ['19:00-20:00', '20:00-21:00', '21:00-22:00'] }, // 周一
    { day: 2, times: ['19:00-20:00', '20:00-21:00', '21:00-22:00'] }, // 周二
    { day: 3, times: ['19:00-20:00', '20:00-21:00', '21:00-22:00'] }, // 周三
    { day: 4, times: ['19:00-20:00', '20:00-21:00', '21:00-22:00'] }, // 周四
    { day: 5, times: ['19:00-20:00', '20:00-21:00', '21:00-22:00'] }, // 周五
    { day: 6, times: ['10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'] }, // 周六
    { day: 0, times: ['10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'] }  // 周日
  ];

  const baseDate = new Date(globalBaseDate.value);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // 生成两周的时间段（本周和下周）
  const allTimeSlots = [];
  
  // 生成本周和下周的时间段
  for (let week = 0; week < 2; week++) {
    baseTimeSlots.forEach(dayConfig => {
      const targetDay = dayConfig.day;
      const currentDay = baseDate.getDay();
      let daysToAdd = targetDay - currentDay;
      
      // 如果目标日期在当前日期之前，加7天到下周
      if (daysToAdd < 0) {
        daysToAdd += 7;
      }
      
      // 加上周数偏移
      daysToAdd += week * 7;
      
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + daysToAdd);
      
      const dateStr = targetDate.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      });
      const dayName = weekdays[targetDay];
      const weekLabel = week === 0 ? '本周' : '下周';
      
      dayConfig.times.forEach(timeRange => {
        allTimeSlots.push({
          key: `${dayName} ${timeRange}`,
          display: `${dayName} ${dateStr} ${timeRange} (${weekLabel})`,
          targetDate: targetDate,
          timeRange: timeRange,
          week: week
        });
      });
    });
  }

  const stats = allTimeSlots.map(slotInfo => {
    const scheduled = schedules.value.filter(schedule => {
      // 使用统一的时间段匹配函数
      const matchedTimeSlot = matchTimeSlotFromDate(schedule.interview_date);
      // 匹配时间段
      if (matchedTimeSlot !== slotInfo.key) return false;
      
      // 通过日期判断是本周还是下周
      const scheduleDate = new Date(schedule.interview_date);
      const baseDate = new Date(globalBaseDate.value);
      const daysDiff = Math.floor((scheduleDate - baseDate) / (1000 * 60 * 60 * 24));
      const scheduleWeek = daysDiff >= 7 ? 1 : 0; // 7天以上算下周
      
      return scheduleWeek === slotInfo.week;
    }).map(schedule => {
      // 获取面试者姓名
      const recruit = recruits.value.find(r => r.uid === schedule.uid);
      return {
        uid: schedule.uid,
        name: recruit ? recruit.name : schedule.uid,
        interviewer: schedule.interviewer,
        stage: schedule.stage,
        interview_date: schedule.interview_date,
        location: schedule.location,
        interview_format: schedule.interview_format
      };
    });

    // 提取面试形式和场地信息
            const interview_formats = [...new Set(scheduled.map(s => s.interview_format).filter(f => f))];
    const venues = [...new Set(scheduled.map(s => s.location).filter(v => v))];

    return {
      slot: slotInfo.display,
      count: scheduled.length,
      scheduled: scheduled || [],
      interview_formats: interview_formats || [],
      venues: venues || []
    };
  });

  // 保存所有时间段统计（包括空的）
  allTimeSlotStats.value = stats;
  
  // 只显示有排班的时间段给表格使用
  timeSlotStats.value = stats.filter(stat => stat.count > 0);
  
  console.log('计算的时间段统计数据:', timeSlotStats.value);
  console.log('所有时间段统计数据:', allTimeSlotStats.value);
  console.log('当前排班数据:', schedules.value);
};

const refreshTimeSlotStats = () => {
  calculateTimeSlotStats();
};

const completeInterview = async (timeSlot) => {
  try {
    console.log('开始完成面试，时间段:', timeSlot);
    
    // 解析时间段和周数
    const timeSlotParts = timeSlot.split(' (');
    if (timeSlotParts.length < 2) {
      window.notyf.error('时间段格式错误');
      return;
    }
    
    const weekLabel = timeSlotParts[1].replace(')', '');
    const week = weekLabel === '本周' ? 0 : 1;
    
    // 提取基础时间段（去掉日期和周标签）
    const baseTimeSlot = timeSlotParts[0]; // 如 "周一 08/22 19:00-20:00"
    // 分割并重新组合，去掉日期部分
    const parts = baseTimeSlot.split(' ');
    let timeSlotWithoutDate;
    if (parts.length >= 3) {
      // 格式: "周一 08/22 19:00-20:00" -> "周一 19:00-20:00"
      timeSlotWithoutDate = `${parts[0]} ${parts[2]}`;
    } else {
      timeSlotWithoutDate = baseTimeSlot;
    }
    
    console.log('解析结果:', { timeSlot, week, weekLabel, baseTimeSlot, timeSlotWithoutDate });
    
    const requestData = {
      time_slot: timeSlotWithoutDate, // 发送不带日期的时间段
      week: week
    };
    console.log('发送请求数据:', requestData);
    
    const response = await axios.post('/interview/complete-interview', requestData);
    
    if (response.data.success) {
      // 显示详细的结果信息
      let resultMessage = response.data.message;
      
      // 如果有详细统计，添加到消息中
      if (response.data.first_round_completed > 0 || response.data.second_round_completed > 0) {
        resultMessage += `\n\n详细统计：`;
        if (response.data.first_round_completed > 0) {
          resultMessage += `\n- 进入二面：${response.data.first_round_completed}人`;
        }
        if (response.data.second_round_completed > 0) {
          resultMessage += `\n- 面试完成并从面试表删除：${response.data.second_round_completed}人`;
        }
      }
      
      window.notyf.success(`面试完成！成功完成 ${response.data.completed_count} 个面试`);
      console.log(resultMessage);
      // 刷新数据
      await refreshData();
    } else {
      window.notyf.error('完成面试失败：' + response.data.message);
    }
  } catch (error) {
    // console.error('完成面试失败:', error);
    window.notyf.error('完成面试失败：' + (error.response?.data?.detail || error.message));
  }
};

const updateGlobalBaseDate = () => {
  // 更新表单中的基准日期
  scheduleForm.base_date = globalBaseDate.value;
  // 重新计算时间段统计
  calculateTimeSlotStats();
};

// 工具方法
const getStageLabel = (stage) => {
  const labels = {
    first_round: '一面',
    second_round: '二面',
    completed: '已完成'
  };
  return labels[stage] || stage;
};

const getInterviewFormatLabel = (format) => {
  const formatLabels = {
    'one_to_one': '一对一',
    'one_to_many': '一对多',
    'many_to_many': '多对多'
  };
  return formatLabels[format] || '一对一';
};

const getStatusLabel = (status) => {
  const labels = {
    pending: '待排班',
    scheduled: '已排班',
    completed: '已完成',
    cancelled: '已取消'
  };
  return labels[status] || status;
};





// 获取面试者的排班状态
const getScheduleStatus = (uid) => {
  const recruit = recruits.value.find(r => r.uid === uid);
  if (!recruit) return 'pending';
  
  // 检查是否已通过面试
  if (recruit.interview_completed)
    return 'completed';
  
  const if_exists_interview = schedules.value.find(s => s.uid === uid);
  return if_exists_interview ? 'scheduled' : 'pending';
};

// 根据UID获取排班信息
const getScheduleByUid = (uid) => {
  return schedules.value.find(s => s.uid === uid);
};

// 获取北京时间的日期对象
const getBeijingDate = (dateString) => {
  const date = new Date(dateString);
  // 获取北京时间（UTC+8）
  const beijingOffset = 8 * 60; // 8小时 = 480分钟
  const localOffset = date.getTimezoneOffset(); // 本地时区偏移（分钟）
  const totalOffset = beijingOffset + localOffset; // 总偏移量
  
  const beijingDate = new Date(date.getTime() + totalOffset * 60 * 1000);
  return beijingDate;
};

// 将北京时间转换为ISO字符串
const beijingToISOString = (beijingDate) => {
  // 创建ISO字符串，但保持北京时间
  const year = beijingDate.getFullYear();
  const month = String(beijingDate.getMonth() + 1).padStart(2, '0');
  const day = String(beijingDate.getDate()).padStart(2, '0');
  const hours = String(beijingDate.getHours()).padStart(2, '0');
  const minutes = String(beijingDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 统一的时间段匹配工具函数
const matchTimeSlotFromDate = (interviewDate) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // 确保使用北京时间
  const beijingDate = getBeijingDate(interviewDate);
  const dayOfWeek = beijingDate.getDay();
  const hour = beijingDate.getHours();
  
  // 将日期转换为中文星期
  const dayName = weekdays[dayOfWeek];
  
  // 根据小时数匹配对应的时间段
  let matchedTimeSlot = '';
  
  // 工作日时间段
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    if (hour >= 19 && hour < 20) matchedTimeSlot = `${dayName} 19:00-20:00`;
    else if (hour >= 20 && hour < 21) matchedTimeSlot = `${dayName} 20:00-21:00`;
    else if (hour >= 21 && hour < 22) matchedTimeSlot = `${dayName} 21:00-22:00`;
  }
  // 周末时间段 - 修复格式匹配
  else if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (hour >= 10 && hour < 11) matchedTimeSlot = `${dayName} 10:00-11:00`;
    else if (hour >= 11 && hour < 12) matchedTimeSlot = `${dayName} 11:00-12:00`;
    else if (hour >= 14 && hour < 15) matchedTimeSlot = `${dayName} 14:00-15:00`;
    else if (hour >= 15 && hour < 16) matchedTimeSlot = `${dayName} 15:00-16:00`;
    else if (hour >= 16 && hour < 17) matchedTimeSlot = `${dayName} 16:00-17:00`;
    else if (hour >= 19 && hour < 20) matchedTimeSlot = `${dayName} 19:00-20:00`;
    else if (hour >= 20 && hour < 21) matchedTimeSlot = `${dayName} 20:00-21:00`;
    else if (hour >= 21 && hour < 22) matchedTimeSlot = `${dayName} 21:00-22:00`;
  }
  
  return matchedTimeSlot;
};

// 计算具体面试日期（北京时间）
const calculateInterviewDate = (baseDate, timeSlot) => {
  if (!baseDate || !timeSlot) return '';
  
  // 使用北京时间计算基准日期
  const base = getBeijingDate(baseDate);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // 从时间段中提取周几信息
  const dayMatch = timeSlot.match(/周[一二三四五六日]/);
  if (!dayMatch) return '';
  
  const targetDay = weekdays.indexOf(dayMatch[0]);
  if (targetDay === -1) return '';
  
  // 计算目标日期
  const currentDay = base.getDay();
  let daysToAdd = targetDay - currentDay;
  
  // 如果目标日期在当前日期之前，加7天
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }
  
  const targetDate = new Date(base);
  targetDate.setDate(base.getDate() + daysToAdd);
  
  // 从时间段中提取时间信息
  const timeMatch = timeSlot.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (!timeMatch) return '';
  
  const hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  
  targetDate.setHours(hour, minute, 0, 0);
  
  // 返回北京时间的ISO字符串
  return beijingToISOString(targetDate);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // 使用北京时间格式化
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// 生命周期
onMounted(() => {
  // 初始化表单的基准日期（只在第一次加载时设置）
  if (!scheduleForm.base_date) {
    scheduleForm.base_date = globalBaseDate.value;
  }
  
  fetchRecruits();
  fetchSchedules();
  // 在数据加载完成后计算时间段统计
  setTimeout(() => {
    calculateTimeSlotStats();
  }, 1000);
});
</script>

<style scoped>
.interview-admin {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  --interview-filter-control-height: 3rem;
  --interview-form-control-height: 2.875rem;
  --interview-table-action-schedule-bg: rgba(59, 130, 246, 0.14);
  --interview-table-action-schedule-border: rgba(37, 99, 235, 0.22);
  --interview-table-action-schedule-text: #1d4ed8;
  --interview-table-action-edit-bg: rgba(34, 197, 94, 0.14);
  --interview-table-action-edit-border: rgba(22, 163, 74, 0.24);
  --interview-table-action-edit-text: #15803d;
  --interview-table-action-notify-bg: rgba(245, 158, 11, 0.15);
  --interview-table-action-notify-border: rgba(217, 119, 6, 0.22);
  --interview-table-action-notify-text: #b45309;
  --interview-table-action-delete-bg: rgba(239, 68, 68, 0.14);
  --interview-table-action-delete-border: rgba(220, 38, 38, 0.22);
  --interview-table-action-delete-text: #b91c1c;
  --interview-table-action-shadow: 0 10px 24px -18px rgba(15, 23, 42, 0.45);
  --interview-header-toolbar-height: calc(2.5rem + 1rem + 2px);
  --interview-refresh-bg: #4f7ede;
  --interview-refresh-bg-hover: #5f8ce7;
  --interview-refresh-border: #4f7ede;
  --interview-refresh-text: #ffffff;
}

.dark .interview-admin {
  --interview-table-action-schedule-bg: rgba(59, 130, 246, 0.18);
  --interview-table-action-schedule-border: rgba(96, 165, 250, 0.22);
  --interview-table-action-schedule-text: #bfdbfe;
  --interview-table-action-edit-bg: rgba(34, 197, 94, 0.18);
  --interview-table-action-edit-border: rgba(74, 222, 128, 0.22);
  --interview-table-action-edit-text: #bbf7d0;
  --interview-table-action-notify-bg: rgba(245, 158, 11, 0.2);
  --interview-table-action-notify-border: rgba(251, 191, 36, 0.2);
  --interview-table-action-notify-text: #fde68a;
  --interview-table-action-delete-bg: rgba(239, 68, 68, 0.18);
  --interview-table-action-delete-border: rgba(248, 113, 113, 0.22);
  --interview-table-action-delete-text: #fecaca;
  --interview-table-action-shadow: 0 10px 24px -20px rgba(2, 6, 23, 0.85);
  --interview-refresh-bg: rgba(34, 197, 94, 0.22);
  --interview-refresh-bg-hover: rgba(34, 197, 94, 0.3);
  --interview-refresh-border: rgba(74, 222, 128, 0.36);
  --interview-refresh-text: #baf7cb;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: bold;
  white-space: nowrap;
  flex: 0 0 auto;
  transition: color 0.3s ease;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 1 auto;
  flex-wrap: nowrap;
  gap: 1rem;
  min-width: fit-content;
}

.base-time-setting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--interview-header-toolbar-height);
  background: var(--bg-surface);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px var(--shadow-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.base-time-setting label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.base-time-setting :deep(.base-date-field) {
  min-width: 11rem;
}

.base-time-setting :deep(.base-date-field .p-datepicker-input) {
  width: 100%;
  min-height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-sizing: border-box;
  box-shadow: none;
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.2s ease;
}

.base-time-setting :deep(.base-date-field.p-focus .p-datepicker-input) {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  outline: none;
}

.add-btn, .refresh-btn, .auto-schedule-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.add-btn {
  background: #4caf50;
  color: white;
}

.add-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.refresh-btn {
  min-height: var(--interview-header-toolbar-height);
  padding: 0 1.1rem;
  border: 1px solid var(--interview-refresh-border);
  border-radius: 12px;
  background: var(--interview-refresh-bg);
  color: var(--interview-refresh-text);
  white-space: nowrap;
  box-shadow: none;
}

.refresh-btn:hover {
  background: var(--interview-refresh-bg-hover);
  border-color: var(--interview-refresh-bg-hover);
  color: var(--interview-refresh-text);
  transform: translateY(-1px);
}

.refresh-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-color) 14%, transparent);
}

.refresh-btn i,
.refresh-btn span {
  color: inherit;
}

.auto-schedule-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.auto-schedule-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

/* 统计面板 */
.stats-panel {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 筛选面板 */
.filter-panel {
  background: var(--bg-surface);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
  margin-bottom: 2rem;
  transition: background-color 0.3s ease;
}

.filter-row {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 1 220px;
  min-width: 220px;
}

.filter-group label {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.filter-group select,
.filter-group input {
  padding: 0 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 150px;
  min-height: var(--interview-filter-control-height);
  background: var(--bg-surface);
  color: var(--text-primary);
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.filter-group :deep(.p-select) {
  width: 100%;
  min-height: var(--interview-filter-control-height);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: none;
  transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.filter-group :deep(.p-select:not(.p-disabled):hover) {
  border-color: var(--border-color);
}

.filter-group :deep(.p-select.p-focus) {
  border-color: var(--border-color);
  box-shadow: none;
  outline: none;
}

.filter-group :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(var(--interview-filter-control-height) - 2px);
  padding: 0 0.875rem;
  color: var(--text-primary);
}

.filter-group :deep(.p-select-label.p-placeholder) {
  color: var(--text-secondary);
}

.filter-group :deep(.p-select-dropdown) {
  width: 2.75rem;
  color: var(--text-secondary);
}

/* 表格样式 */
.table-container {
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
  overflow-x: auto;
  overflow-y: hidden;
  transition: background-color 0.3s ease;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  transition: color 0.3s ease;
}

.empty-action {
  padding: 0.75rem 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
}

.interview-table {
  width: 100%;
  border-collapse: collapse;
}

.interview-table th,
.interview-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.interview-table th {
  background: var(--bg-secondary);
  font-weight: bold;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.interview-table tr:hover {
  background: var(--bg-secondary);
}

.recruits-table .stage-badge,
.recruits-table .status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  min-height: 1.85rem;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
}

.recruits-table .stage-badge.screening {
  background: #eaf2ff;
  color: #2f73da;
  border-color: #bfd8ff;
}

.recruits-table .stage-badge.first_round {
  background: #fff3e0;
  color: #c97715;
  border-color: #f7c68f;
}

.recruits-table .stage-badge.second_round {
  background: #f3e8ff;
  color: #7b4ab1;
  border-color: #dec6fa;
}

.recruits-table .stage-badge.completed {
  background: #ecfdf3;
  color: #0f8a62;
  border-color: #a7f3d0;
}

.result-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.result-badge.pass {
  background: #e8f5e8;
  color: #2e7d32;
}

.result-badge.fail {
  background: #ffebee;
  color: #c62828;
}

.result-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

.result-badge.recommended {
  background: #f3e5f5;
  color: #7b1fa2;
}

.score {
  font-weight: bold;
  color: #ff9800;
}

.no-score {
  color: #999;
}

.col-actions {
  min-width: 10rem;
}

.table-action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.table-action-btn {
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid transparent;
  border-radius: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  box-shadow: var(--interview-table-action-shadow);
}

.table-action-btn i {
  font-size: 0.96rem;
}

.table-action-btn:hover {
  transform: translateY(-1px);
}

.table-action-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-color) 18%, transparent), var(--interview-table-action-shadow);
}

.table-action-btn--schedule {
  background: var(--interview-table-action-schedule-bg);
  border-color: var(--interview-table-action-schedule-border);
  color: var(--interview-table-action-schedule-text);
}

.table-action-btn--schedule:hover {
  background: color-mix(in srgb, var(--interview-table-action-schedule-bg) 72%, white 28%);
  border-color: color-mix(in srgb, var(--interview-table-action-schedule-border) 84%, var(--interview-table-action-schedule-text) 16%);
}

.table-action-btn--edit {
  background: var(--interview-table-action-edit-bg);
  border-color: var(--interview-table-action-edit-border);
  color: var(--interview-table-action-edit-text);
}

.table-action-btn--edit:hover {
  background: color-mix(in srgb, var(--interview-table-action-edit-bg) 72%, white 28%);
  border-color: color-mix(in srgb, var(--interview-table-action-edit-border) 84%, var(--interview-table-action-edit-text) 16%);
}

.table-action-btn--notify {
  background: var(--interview-table-action-notify-bg);
  border-color: var(--interview-table-action-notify-border);
  color: var(--interview-table-action-notify-text);
}

.table-action-btn--notify:hover {
  background: color-mix(in srgb, var(--interview-table-action-notify-bg) 72%, white 28%);
  border-color: color-mix(in srgb, var(--interview-table-action-notify-border) 84%, var(--interview-table-action-notify-text) 16%);
}

.table-action-btn--delete {
  background: var(--interview-table-action-delete-bg);
  border-color: var(--interview-table-action-delete-border);
  color: var(--interview-table-action-delete-text);
}

.table-action-btn--delete:hover {
  background: color-mix(in srgb, var(--interview-table-action-delete-bg) 72%, white 28%);
  border-color: color-mix(in srgb, var(--interview-table-action-delete-border) 84%, var(--interview-table-action-delete-text) 16%);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: #2196f3;
}

.action-btn.edit:hover {
  background: #1976d2;
}

.action-btn.notify {
  background: #ff9800;
}

.action-btn.notify:hover {
  background: #f57c00;
}

.action-btn.delete {
  background: #f44336;
}

.action-btn.delete:hover {
  background: #d32f2f;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.pagination-wrapper :deep(.p-paginator) {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 10px;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.pagination-wrapper :deep(.p-paginator-page),
.pagination-wrapper :deep(.p-paginator-first),
.pagination-wrapper :deep(.p-paginator-prev),
.pagination-wrapper :deep(.p-paginator-next),
.pagination-wrapper :deep(.p-paginator-last) {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-color);
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.pagination-wrapper :deep(.p-paginator-page:hover),
.pagination-wrapper :deep(.p-paginator-first:hover),
.pagination-wrapper :deep(.p-paginator-prev:hover),
.pagination-wrapper :deep(.p-paginator-next:hover),
.pagination-wrapper :deep(.p-paginator-last:hover) {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.pagination-wrapper :deep(.p-paginator-page.p-paginator-page-selected) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown) {
  min-height: 2.5rem;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown:not(.p-disabled):hover) {
  border-color: color-mix(in srgb, var(--border-color) 72%, var(--accent-color) 28%);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown.p-focus) {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown .p-select-label),
.pagination-wrapper :deep(.p-paginator-rpp-dropdown .p-select-dropdown) {
  color: inherit;
}

.pagination-wrapper :deep(.p-paginator-current) {
  color: var(--text-primary);
  font-weight: 600;
  padding: 0 0.25rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  transition: background-color 0.3s ease;
}

.interview-form-modal {
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow-color);
  transition: background-color 0.3s ease;
}

.auto-schedule-modal {
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow-color);
  transition: background-color 0.3s ease;
}

.auto-schedule-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.info-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.info-section ul {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.info-section li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.form-section {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.form-section h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.warning-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #856404;
}

.warning-section i {
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

.warning-section span {
  line-height: 1.5;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.modal-body {
  padding: 1.5rem;
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
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.form-section h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--bg-surface);
  color: var(--text-primary);
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease;
}

.form-group input,
.form-group select {
  min-height: var(--interview-form-control-height);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.form-group :deep(.p-select) {
  width: 100%;
  min-height: var(--interview-form-control-height);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: none;
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease;
}

.form-group :deep(.p-select:not(.p-disabled):hover) {
  border-color: var(--border-color);
}

.form-group :deep(.p-select.p-focus) {
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
  outline: none;
}

.form-group :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: calc(var(--interview-form-control-height) - 2px);
  padding: 0 0.75rem;
  color: var(--text-primary);
}

.form-group :deep(.p-select-label.p-placeholder) {
  color: var(--text-secondary);
}

.form-group :deep(.p-select-dropdown) {
  width: 2.75rem;
  color: var(--text-secondary);
}

.form-group :deep(.p-datepicker) {
  width: 100%;
}

.form-group :deep(.p-datepicker-input) {
  width: 100%;
  min-height: var(--interview-form-control-height);
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-sizing: border-box;
  box-shadow: none;
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.2s ease;
}

.form-group :deep(.p-datepicker.p-focus .p-datepicker-input) {
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
  outline: none;
}

.form-group :deep(.p-datepicker-input::placeholder) {
  color: var(--text-secondary);
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
  border-top: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: var(--bg-secondary);
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



/* 抽屉样式 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}

.drawer-content {
  background: var(--bg-surface);
  width: 500px;
  max-width: 90vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 10px var(--shadow-color);
  animation: slideIn 0.3s ease-out;
  transition: background-color 0.3s ease;
}

/* 时间段信息抽屉样式 */
.time-slot-info-drawer {
  background: var(--bg-surface);
  width: 400px;
  max-width: 80vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px var(--shadow-color);
  animation: slideInLeft 0.3s ease-out;
  position: relative;
  z-index: 1001;
  transition: background-color 0.3s ease;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.time-slot-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.time-slot-info-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.time-slot-info-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.time-slot-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.time-slot-summary h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.stat-item i {
  color: #007bff;
  font-size: 1rem;
}

.scheduled-candidates h6 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.empty-candidates {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem 0;
  transition: color 0.3s ease;
}

.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.candidate-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.candidate-card:hover {
  box-shadow: 0 2px 4px var(--shadow-color);
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.candidate-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.candidate-uid {
  color: var(--text-secondary);
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.candidate-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.candidate-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.candidate-time i {
  color: #007bff;
}

/* 时间段选择器样式 */
.time-slot-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-slot-selector select {
  flex: 1;
}

.time-slot-selector :deep(.time-slot-select) {
  flex: 1;
}

.info-btn {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--accent-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
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
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.drawer-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.drawer-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* 表格优化样式 */
.recruits-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-surface);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: background-color 0.3s ease;
}

.recruits-table th {
  background: var(--bg-secondary);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  font-size: 0.9rem;
  white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
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

.recruits-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  transition: border-color 0.3s ease;
}

.recruits-table th.col-uid,
.recruits-table th.col-name,
.recruits-table th.col-major,
.recruits-table th.col-grade,
.recruits-table th.col-stage,
.recruits-table th.col-status,
.recruits-table th.col-interview-time,
.recruits-table th.col-format,
.recruits-table th.col-notification,
.recruits-table td.col-uid,
.recruits-table td.col-name,
.recruits-table td.col-major,
.recruits-table td.col-grade,
.recruits-table td.col-stage,
.recruits-table td.col-status,
.recruits-table td.col-interview-time,
.recruits-table td.col-format,
.recruits-table td.col-notification {
  white-space: nowrap;
}

.recruits-table td.col-name {
  min-width: 5.5rem;
}

/* 分页补齐空行：固定每页表格视觉高度，避免最后一页变短导致下方卡片上移 */
.recruits-table .recruit-table-filler-row td {
  height: 56px;
  padding: 0 0.75rem;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
}

.recruits-table tr:hover {
  background: var(--bg-secondary);
}

.no-schedule {
  color: var(--text-secondary);
  font-style: italic;
  transition: color 0.3s ease;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  transition: color 0.3s ease;
}

/* 通知状态样式 */
.notification-sent {
  color: #4caf50;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.notification-sent i {
  font-size: 1rem;
}

.notification-pending {
  color: #ff9800;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.notification-pending i {
  font-size: 1rem;
}

/* 通知确认弹窗样式 */
.notification-modal {
  max-width: 600px;
  width: 90%;
}

.notification-info h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.info-item span {
  color: var(--text-primary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.notification-message {
  margin-bottom: 1.5rem;
}

.notification-message label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.notification-message textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  background: var(--bg-surface);
  color: var(--text-primary);
  transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.notification-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
}

.notification-warning i {
  color: #f39c12;
  font-size: 1.1rem;
  margin-top: 0.1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
}

/* 排班按钮样式 */
.action-btn.schedule {
  background: #4caf50;
  color: white;
}

.action-btn.schedule:hover {
  background: #45a049;
}

/* 状态徽章样式 */
.recruits-table .status-badge.pending {
  background: #fff7e8;
  color: #b96b08;
  border-color: #f3d39c;
}

.recruits-table .status-badge.scheduled {
  background: #eaf2ff;
  color: #2f73da;
  border-color: #bfd8ff;
}

.recruits-table .status-badge.completed {
  background: #ecfdf3;
  color: #0f8a62;
  border-color: #a7f3d0;
}

.recruits-table .status-badge.cancelled {
  background: #ffe8eb;
  color: #cf415e;
  border-color: #f6bcc7;
}



/* 响应式设计 */
@media (max-width: 1200px) {
  .recruits-table {
    font-size: 0.85rem;
  }
  
  .recruits-table th,
  .recruits-table td {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .interview-admin {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .pagination-wrapper :deep(.p-paginator) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .recruits-table {
    font-size: 0.75rem;
  }
  
  .recruits-table th,
  .recruits-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-btn {
    padding: 0.25rem;
    font-size: 0.7rem;
  }
  
  .drawer-content {
    width: 100vw;
  }
}

/* 时间段排班统计表格样式 */
.time-slot-stats-table {
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
  margin-top: 2rem;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.table-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.refresh-btn-small {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
}

.refresh-btn-small:hover {
  background: var(--bg-secondary);
}

.time-slot-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-surface);
  transition: background-color 0.3s ease;
}

.time-slot-table th {
  background: var(--bg-secondary);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  font-size: 0.9rem;
  white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.time-slot-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
  transition: border-color 0.3s ease;
}

.time-slot-table tr:hover {
  background: var(--bg-secondary);
}

.time-slot-cell {
  min-width: 200px;
}

.time-slot-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-slot-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.count-badge {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  align-self: flex-start;
}

.count-cell {
  text-align: center;
}

.count-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.interviewer-cell, .venue-cell {
  min-width: 120px;
}

.interviewer-list, .venue-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.interviewer-tag, .venue-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
  margin-bottom: 0.25rem;
}

.no-interviewer, .no-venue {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.candidates-cell {
  min-width: 240px;
}

.candidates-list {
  max-height: 200px;
  overflow-y: auto;
}

.candidate-item {
  padding: 0.5rem 0;
}

.candidate-info {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  max-width: 100%;
  padding-bottom: 0.45rem;
}

.candidate-item:not(:last-child) .candidate-info::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: min(100%, 14rem);
  height: 1px;
  background: var(--border-color);
  transition: background-color 0.3s ease;
}

.candidate-name {
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.candidate-uid {
  color: var(--text-secondary);
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.empty-slot {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 1rem;
  transition: color 0.3s ease;
}

.scheduled-item {
  background: var(--bg-surface);
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.scheduled-item:hover {
  border-color: var(--accent-color);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.scheduled-item:last-child {
  margin-bottom: 0;
}

.person-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.person-name {
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.person-uid {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.person-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.interviewer {
  color: var(--text-secondary);
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.stage-badge {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stage-badge.first_round {
  background: #fff3e0;
  color: #f57c00;
}

.stage-badge.second_round {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* 操作按钮样式 */
.action-cell {
  min-width: 120px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn.complete {
  background: #4caf50;
  color: white;
}

.action-btn.complete:hover {
  background: #388e3c;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .time-slot-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .time-slot-header {
    padding: 0.75rem;
  }
  
  .scheduled-list {
    padding: 0.75rem;
  }
  
  .person-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
