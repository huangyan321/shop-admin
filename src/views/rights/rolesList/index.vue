<template>
  <div id="roles">
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item0, index0) in scope.row.children"
              :key="item0.id"
              :class="['bdbottom', index0 === 0 ? 'bdtop' : '']"
              class="vcenter"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRights(scope.row, item0.id)">{{
                  item0.authName
                }}</el-tag>
                <i class="el-icon-caret-right" />
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item1, index1) in item0.children"
                  :key="item1.id"
                  :class="['bdtop', index1 === 0 ? '' : 'bdtop']"
                  class="vcenter"
                >
                  <!-- 二级权限展示区域 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRights(scope.row, item1.id)"
                    >{{ item1.authName }}</el-tag>
                    <i class="el-icon-caret-right" />
                  </el-col>
                  <!-- 三级权限展示区域 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item2 in item1.children"
                      :key="item2.id"
                      type="warning"
                      closable
                      @close="removeRights(scope.row, item2.id)"
                    >
                      {{ item2.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="roleDelete(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="ShowRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 角色添加对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <!-- 对话框主体部分 -->
      <el-form
        ref="addRoleDialogFormRef"
        :model="addRoleDialogForm"
        :rules="addRoleDialogRules"
        label-width="90px"
      >
        <!-- 添加角色名称区域 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleDialogForm.roleName" />
        </el-form-item>
        <!-- 添加角色描述区域 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleDialogForm.roleDesc" />
        </el-form-item>
      </el-form>
      <!-- 对话框底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sureAddRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="showRightDialogVisible"
      width="50%"
      @close="ShowRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="rightsListProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRightsList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      roleList: [],
      addRoleDialogForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleDialogRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      addRoleDialogVisible: false,
      // 分配权限对话框的隐藏于展示
      showRightDialogVisible: false,
      rightsList: [],
      rightsListProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      } else {
        this.roleList = res.data
      }
    },
    addRole() {
      this.addRoleDialogVisible = true
    },
    // 关闭对话框清空内容
    addRoleDialogClosed() {
      this.$refs.addRoleDialogFormRef.resetFields()
    },
    // 确认添加角色
    sureAddRole() {
      this.$refs.addRoleDialogFormRef.validate(async(valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          'roles',
          this.addRoleDialogForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败!')
        } else {
          this.getRolesList()
          this.$message.success('添加成功!')
        }
      })
    },
    // 删除角色
    roleDelete(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete(`roles/${id}`)
          // console.log(res);
          if (res.meta.status !== 200) {
            this.$message({
              type: 'error',
              message: '删除失败!'
            })
          } else {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getRolesList()
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 删除指定的权限
    removeRights(role, rightsId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightsId}`
          )
          console.log(role.id)
          if (res.meta.status !== 200) {
            this.$message({
              type: 'error',
              message: '删除权限失败!'
            })
          } else {
            this.$message({
              type: 'success',
              message: '删除权限成功!'
            })
            this.role.children = res.data;
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 获取权限对话框
    async ShowRightDialog(role) {
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败!')
      } else {
        this.rightsList = res.data
        this.roleId = role.id
      }
      // 利用递归获取三级权限的id
      this.getDefKeys(role, this.defKeys)
      this.showRightDialogVisible = true
    },
    // 利用递归获取三级权限的id，并保存到defKeys 数组中
    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getDefKeys(item, arr)
      })
    },
    // 对话框关闭时时清空defKeys数组
    ShowRightDialogClosed() {
      this.defKeys = []
    },
    // 为角色增加权限
    async addRightsList() {
      const checkId = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const str = checkId.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: str
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('添加权限失败!')
      } else {
        this.$message.success('添加权限成功!')
        this.getRolesList()
      }
    }
  }
}
</script>

<style scoped>
.bdbottom {
  border-bottom: 1px solid #eee;
}

.bdtop {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
