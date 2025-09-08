const { pgCore } = require('../../config/database');
const {
  mappingSuccess,
  mappingError,
  setPayloadToken,
  isValidPassword,
  ROLE,
  generatePassword,
} = require('../../utils');
const { generateCustomerNo } = require('../../utils/customer')
const { lang } = require('../../lang');
const {
  TABLE,
  TABLE_CUSTOMER,
  TABLE_CLIENT,
  COLUMN,
  COLUMN_CUSTOMER,
  COLUMN_ME,
  COLUMN_CUSTOMER_ME,
  COLUMN_CLIENT,
  COLUMN_CLIENT_ME,
  TABLE_JOIN,
} = require('./column');
/**
 * @param {object} where
 * @param {string} password
 * @param {array} column
 * @return {object}
 */
const getByParam = async (where, password, column = COLUMN) => {
  try {
    where[`${TABLE}.deleted_at`] = null;
    // Convert username to user_name for the query
    if (where.username) {
      where[`${TABLE}.user_name`] = where.username;
      delete where.username;
    }
    const [result] = await pgCore(TABLE)
      .innerJoin(TABLE_JOIN, `${TABLE_JOIN}.role_id`, `${TABLE}.role_id`)
      .select(column)
      .where(where);
    if (result) {
      const validationPassword = isValidPassword(
        password,
        result.password,
        result.salt
      );
      if (result?.status === false && validationPassword === true) {
        const response = mappingSuccess(
          lang.__('get.success'),
          setPayloadToken(result)
        );
        return response?.data;
      }
      if (result?.status === false && validationPassword === false) {
        return mappingSuccess(lang.__('password.invalid'), [], 201, false);
      }
      return mappingSuccess(lang.__('account.not.active'), [], 201, false);
    }
    return mappingSuccess(
      lang.__('username.not.found', { val: where?.username }),
      [],
      201,
      false
    );
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const getByParamInspection = async (where, password, column = COLUMN) => {
  try {
    where[`${TABLE}.deleted_at`] = null;
    // Convert username to user_name for the query
    if (where.username) {
      where[`${TABLE}.user_name`] = where.username;
      delete where.username;
    }
    const [result] = await pgCore(TABLE)
      .innerJoin(TABLE_JOIN, `${TABLE_JOIN}.role_id`, `${TABLE}.role_id`)
      .select(column)
      .where(where)
      .where((builder) => {
        builder
          .where(where)
          .whereIn(`${TABLE_JOIN}.role_name`, ROLE.ONLY_INSPECTION);
      });

    if (result) {
      const validationPassword = isValidPassword(
        password,
        result.password,
        result.salt
      );
      if (result?.status === false && validationPassword === true) {
        const response = mappingSuccess(
          lang.__('get.success'),
          setPayloadToken(result, 'admin', true)
        );


        return response?.data;
      }
      if (result?.status === false && validationPassword === false) {
        return mappingSuccess(lang.__('password.invalid'), [], 201, false);
      }
      return mappingSuccess(lang.__('account.not.active'), [], 201, false);
    }
    return mappingSuccess(
      lang.__('username.not.found', { val: where?.username }),
      [],
      201,
      false
    );
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const customerSignin = async (email, password, column = COLUMN_CUSTOMER) => {
  try {
    const [result] = await pgCore(TABLE_CUSTOMER)
      .select(column)
      .where((builder) => {
        builder.whereILike('email', `${email}%`).andWhere('deleted_at', null);
      });
    if (result) {
      const validationPassword = isValidPassword(
        password,
        result.password,
        result.salt
      );
      if (result?.status === false && validationPassword === true) {
        result.role_name = ROLE.CUSTOMER_BUYER;
        const response = mappingSuccess(
          lang.__('get.success'),
          setPayloadToken(result, 'front')
        );
        return response?.data;
      }
      if (result?.status === false && validationPassword === false) {
        return mappingSuccess(lang.__('password.invalid'), [], 201, false);
      }
      return mappingSuccess(lang.__('account.not.active'), [], 201, false);
    }
    return mappingSuccess(
      lang.__('username.not.found', { val: email }),
      [],
      201,
      false
    );
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const refreshTokenCustomer = async (where, column = COLUMN_CUSTOMER) => {
  try {
    where[`${TABLE_CUSTOMER}.deleted_at`] = null;
    const [result] = await pgCore(TABLE_CUSTOMER).select(column).where(where);
    if (result) {
      result.role_name = ROLE.CUSTOMER_BUYER;
      const response = mappingSuccess(
        lang.__('get.success'),
        setPayloadToken(result, 'front')
      );
      return response?.data;
    }
    return mappingSuccess(lang.__('not.found'));
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const meCustomer = async (where, column = COLUMN_CUSTOMER_ME) => {
  try {
    where[`${TABLE_CUSTOMER}.deleted_at`] = null;
    const [result] = await pgCore(TABLE_CUSTOMER).select(column).where(where);
    if (result) {
      return mappingSuccess(lang.__('get.success'), result);
    }
    return mappingSuccess(lang.__('not.found'), [], 201, false);
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const conductorSignin = async (where, password, column = COLUMN) => {
  try {
    where[`${TABLE}.deleted_at`] = null;
    // Convert username to user_name for the query
    if (where.username) {
      where[`${TABLE}.user_name`] = where.username;
      delete where.username;
    }
    const [result] = await pgCore(TABLE)
      .leftJoin(TABLE_JOIN, `${TABLE_JOIN}.role_id`, `${TABLE}.role_id`)
      .select(column)
      .where(where);
    if (result) {
      const validationPassword = isValidPassword(
        password,
        result.password,
        result.salt
      );
      if (
        result?.status === false
        && validationPassword === true
        && ROLE.ONLY_CONDUCTOR.includes(result?.role_name)
      ) {
        const response = mappingSuccess(
          lang.__('get.success'),
          setPayloadToken(result)
        );
        return response?.data;
      }
      if (result?.status === false && validationPassword === false) {
        return mappingSuccess(lang.__('password.invalid'), [], 201, false);
      }
      return mappingSuccess(lang.__('account.not.access'), [], 201, false);
    }
    return mappingSuccess(
      lang.__('username.not.found', { val: where?.username }),
      [],
      201,
      false
    );
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const refreshToken = async (where, column = COLUMN) => {
  try {
    where[`${TABLE}.deleted_at`] = null;
    const [result] = await pgCore(TABLE)
      .innerJoin(TABLE_JOIN, `${TABLE_JOIN}.role_id`, `${TABLE}.role_id`)
      .select(column)
      .where(where);
    if (result) {
      const response = mappingSuccess(
        lang.__('get.success'),
        setPayloadToken(result)
      );
      return response?.data;
    }
    return mappingSuccess(
      lang.__('not.found.value', { value: result?.username })
    );
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const getPermissions = async (result) => {
  try {
    const permissions = await pgCore.raw(`select concat(mam.permission_name, '.',mp.name)
    from mst_menu_has_permissions mmhp
    inner join mst_permissions mp on mmhp.permission_id = mp.id
    inner join mst_admin_menu mam on mmhp.menu_id = mam.menu_id
    inner join mst_role_has_permissions mrhp on mmhp.permission_id = mrhp.permission_id
    and mmhp.menu_id = mrhp.menu_id and mrhp.role_id = '${result?.role_id}'`);
    return permissions?.rows;
  } catch (error) {
    return error;
  }
};

const getUserInfo = async (userId) => {
  try {
    const userInfo = await pgCore('users')
      .select([
        'users.user_id as id',
        'users.user_name as username',
        'users.user_email as email',
        'users.is_delete as is_active',
        'users.created_at',
        'users.updated_at',
        'employees.employee_id',
        'employees.employee_name as name',
        'employees.employee_email',
        'departments.department_id',
        'departments.department_name',
        'titles.title_id',
        'titles.title_name',
        'roles.role_id',
        'roles.role_name'
      ])
      .leftJoin('employees', 'users.employee_id', 'employees.employee_id')
      .leftJoin('titles', 'employees.title_id', 'titles.title_id')
      .leftJoin('departments', 'titles.department_id', 'departments.department_id')
      .leftJoin('roles', 'users.role_id', 'roles.role_id')
      .where('users.user_id', userId)
      .where('users.is_delete', false)
      .first();

    if (userInfo) {
      return {
        user: {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          is_active: !userInfo.is_active,
          created_at: userInfo.created_at,
          updated_at: userInfo.updated_at
        },
        employee: {
          id: userInfo.employee_id,
          name: userInfo.name,
          email: userInfo.employee_email,
          department_id: userInfo.department_id,
          title_id: userInfo.title_id,
          department: {
            id: userInfo.department_id,
            name: userInfo.department_name
          },
          title: {
            id: userInfo.title_id,
            name: userInfo.title_name
          }
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

const getSystemAccess = async (userId) => {
  try {
    // Get user's role
    const userRole = await pgCore('users')
      .select('role_id')
      .where('user_id', userId)
      .where('is_delete', false)
      .first();

    if (!userRole) return [];

    // Get systems with their menus and permissions
    const systems = await pgCore('systems')
      .select([
        'systems.system_id',
        'systems.system_name',
        'systems.system_url as system_base_url',
        'systems.is_delete as system_is_active'
      ])
      .where('systems.is_delete', false);

    const systemAccess = [];

    for (const system of systems) {
      // Get menus for this system
      const menus = await pgCore('systemHasMenus')
        .select([
          'menus.menu_id',
          'menus.menu_name',
          'menus.menu_url as menu_path',
          'menus.menu_order as menu_order_index',
          'menus.is_delete as menu_is_active'
        ])
        .leftJoin('menus', 'systemHasMenus.menu_id', 'menus.menu_id')
        .where('systemHasMenus.system_id', system.system_id)
        .where('menus.is_delete', false)
        .orderBy('menus.menu_order');

      const accessList = [];

      for (const menu of menus) {
        // Get permissions for this menu and role
        const permissions = await pgCore('roleHasMenuPermissions')
          .select([
            'permissions.permission_id',
            'permissions.permission_name',
            'permissions.permission_name as permission_slug',
            'permissions.permission_name as permission_description'
          ])
          .leftJoin('permissions', 'roleHasMenuPermissions.permission_id', 'permissions.permission_id')
          .where('roleHasMenuPermissions.role_id', userRole.role_id)
          .where('roleHasMenuPermissions.menu_id', menu.menu_id)
          .where('permissions.is_delete', false);

        if (permissions.length > 0) {
          accessList.push({
            menu_id: menu.menu_id,
            menu_name: menu.menu_name,
            menu_description: menu.menu_name,
            menu_path: menu.menu_path,
            menu_order_index: menu.menu_order_index,
            menu_is_active: !menu.menu_is_active,
            permissions: permissions.map(p => ({
              permission_id: p.permission_id,
              permission_name: p.permission_name,
              permission_slug: p.permission_slug,
              permission_description: p.permission_description
            }))
          });
        }
      }

      if (accessList.length > 0) {
        // Get role info
        const roleInfo = await pgCore('roles')
          .select([
            'roles.role_id as role_id',
            'roles.role_name as role_name',
            'roles.role_name as role_slug',
            'roles.role_name as role_description'
          ])
          .where('roles.role_id', userRole.role_id)
          .where('roles.is_delete', false)
          .first();

        systemAccess.push({
          system_id: system.system_id,
          system_name: system.system_name,
          system_description: system.system_name,
          system_base_url: system.system_base_url,
          system_is_active: !system.system_is_active,
          roles: roleInfo ? [{
            role_id: roleInfo.role_id,
            role_name: roleInfo.role_name,
            role_slug: roleInfo.role_slug,
            role_description: roleInfo.role_description
          }] : [],
          access_list: accessList
        });
      }
    }

    return systemAccess;
  } catch (error) {
    console.error('Error getting system access:', error);
    return [];
  }
};

const me = async (where, column = COLUMN_ME) => {
  try {
    where[`${TABLE}.deleted_at`] = null;
    const [result] = await pgCore(TABLE)
      .innerJoin(TABLE_JOIN, `${TABLE_JOIN}.role_id`, `${TABLE}.role_id`)
      .select(column)
      .where(where);
    if (result) {
      const permissions = await getPermissions(result);
      result.permissions = permissions.map((obj) => obj.concat.toLowerCase().split(' ').join(''));
      return mappingSuccess(lang.__('get.success'), result);
    }
    return mappingSuccess(lang.__('not.found'), [], 201, false);
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const meNew = async (userId) => {
  try {
    const userInfo = await getUserInfo(userId);
    if (!userInfo) {
      return mappingSuccess(lang.__('not.found'), [], 201, false);
    }

    const systemAccess = await getSystemAccess(userId);
    
    // Generate new access token
    const tokenPayload = {
      sub: userId,
      full_name: userInfo.employee.name,
      roles: systemAccess.map(system => system.roles.map(role => role.role_name)).flat(),
      jti: require('uuid').v4(),
      exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = require('jsonwebtoken').sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    const response = {
      userInfo,
      system_access: systemAccess,
      access_token: accessToken
    };

    return mappingSuccess(lang.__('get.success'), response);
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const clientSignin = async (email, password, column = COLUMN_CLIENT) => {
  try {
    const [result] = await pgCore(TABLE_CLIENT)
      .select(column)
      .where((builder) => {
        builder.whereILike('email', `${email}%`).andWhere('deleted_at', null);
      });
    if (result) {
      const validationPassword = isValidPassword(
        password,
        result.password,
        result.salt
      );
      if (result?.status === false && validationPassword === true) {
        result.role_name = ROLE.CLIENT_SELLER;
        const response = mappingSuccess(
          lang.__('get.success'),
          setPayloadToken(result, 'front')
        );
        return response?.data;
      }
      if (result?.status === false && validationPassword === false) {
        return mappingSuccess(lang.__('password.invalid'), [], 201, false);
      }
      return mappingSuccess(lang.__('account.not.active'), [], 201, false);
    }
    return mappingSuccess(
      lang.__('username.not.found', { val: email }),
      [],
      201,
      false
    );
  } catch (error) {
    console.log(error)
    error.path = __filename;
    return mappingError(error);
  }
};

const refreshTokenClient = async (where, column = COLUMN_CLIENT) => {
  try {
    where[`${TABLE_CLIENT}.deleted_at`] = null;
    const [result] = await pgCore(TABLE_CLIENT).select(column).where(where);
    if (result) {
      result.role_name = ROLE.CLIENT_SELLER;
      const response = mappingSuccess(
        lang.__('get.success'),
        setPayloadToken(result, ROLE.CLIENT_SELLER)
      );
      return response?.data;
    }
    return mappingSuccess(lang.__('not.found'));
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const meClient = async (where, column = COLUMN_CLIENT_ME) => {
  try {
    where[`${TABLE_CLIENT}.deleted_at`] = null;
    const [result] = await pgCore(TABLE_CLIENT).select(column).where(where);
    if (result) {
      return mappingSuccess(lang.__('get.success'), result);
    }
    return mappingSuccess(lang.__('not.found'), [], 201, false);
  } catch (error) {
    error.path = __filename;
    return mappingError(error);
  }
};

const registerCustomer = async (payload) => {
  try {
    // Generate customer number
    const customerNo = await generateCustomerNo()

    // Prepare customer data with proper password handling
    const passwordPayload = { password: payload.password }
    const { password, salt } = generatePassword(passwordPayload)

    // Prepare customer data
    const customerData = {
      ...payload,
      password,
      salt,
      customer_no: customerNo,
      registration_date: new Date(),
      status: '1', // Active by default
      created_at: new Date()
    }

    // Insert into database
    const [result] = await pgCore(TABLE_CUSTOMER)
      .insert(customerData)
      .returning('*')

    return mappingSuccess(lang.__('create.success'), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  getByParam,
  getByParamInspection,
  refreshToken,
  refreshTokenCustomer,
  customerSignin,
  conductorSignin,
  me,
  meNew,
  meCustomer,
  clientSignin,
  meClient,
  refreshTokenClient,
  registerCustomer
};
