// 全局变量
let uploadedFile = null;
let processedData = null;
let startTime = null;

// DOM 元素
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const processBtn = document.getElementById('processBtn');
const uploadSection = document.getElementById('uploadSection');
const progressSection = document.getElementById('progressSection');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const logContainer = document.getElementById('logContainer');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const retryBtn = document.getElementById('retryBtn');
const errorMessage = document.getElementById('errorMessage');

// 初始化事件监听
function init() {
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 按钮点击
    processBtn.addEventListener('click', processFile);
    downloadBtn.addEventListener('click', downloadResult);
    resetBtn.addEventListener('click', reset);
    retryBtn.addEventListener('click', reset);
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayFileInfo(file);
    }
}

// 处理拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// 处理文件拖放
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
        displayFileInfo(file);
    } else {
        showError('请上传 ZIP 格式的文件');
    }
}

// 显示文件信息
function displayFileInfo(file) {
    uploadedFile = file;
    fileName.textContent = `📄 ${file.name}`;
    fileSize.textContent = `大小: ${formatFileSize(file.size)}`;
    fileInfo.style.display = 'block';
    processBtn.style.display = 'inline-block';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 添加日志
function addLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 更新进度
function updateProgress(percent, message) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = message;
}

// 处理文件
async function processFile() {
    if (!uploadedFile) {
        showError('请先选择文件');
        return;
    }

    startTime = Date.now();
    
    // 显示进度区域
    progressSection.style.display = 'block';
    processBtn.disabled = true;
    logContainer.innerHTML = '';
    
    try {
        addLog('开始处理文件...', 'info');
        updateProgress(10, '正在解压 ZIP 文件...');
        
        // 解压 ZIP 文件
        const zip = await JSZip.loadAsync(uploadedFile);
        addLog('ZIP 文件解压成功', 'success');
        updateProgress(20, '正在读取附表文件...');
        
        // 查找附表目录
        const attachmentsFiles = await findAttachmentFiles(zip);
        addLog(`找到 ${Object.keys(attachmentsFiles).length} 个附表文件`, 'success');
        updateProgress(40, '正在加载 Excel 数据...');
        
        // 加载所有附表数据
        const data = await loadAllAttachments(attachmentsFiles);
        addLog('所有附表加载完成', 'success');
        updateProgress(60, '正在处理数据...');
        
        // 生成工资表
        const result = await generateTable5(data);
        addLog(`工资表生成成功，共 ${result.length} 条记录`, 'success');
        updateProgress(90, '正在准备结果...');
        
        processedData = result;
        
        updateProgress(100, '处理完成！');
        addLog('全部处理完成！', 'success');
        
        // 延迟显示结果
        setTimeout(() => {
            showResult(result);
        }, 500);
        
    } catch (error) {
        console.error('处理错误:', error);
        addLog(`错误: ${error.message}`, 'error');
        showError(`处理失败: ${error.message}\n\n${error.stack || ''}`);
    }
}

// 查找附表文件
async function findAttachmentFiles(zip) {
    const files = {};
    const attachmentPattern = /附表|fubiao/i;
    
    // 遍历 ZIP 中的所有文件
    for (const [path, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        
        // 检查是否在附表目录中
        if (attachmentPattern.test(path)) {
            const filename = path.split('/').pop();
            
            // 匹配附表文件
            if (filename.match(/附\s*9.*\.xlsx?$/i)) files.attachment9 = zipEntry;
            else if (filename.match(/附\s*10.*\.xlsx?$/i)) files.attachment10 = zipEntry;
            else if (filename.match(/附\s*11.*\.xlsx?$/i)) files.attachment11 = zipEntry;
            else if (filename.match(/附\s*14.*\.xls$/i)) files.attachment14 = zipEntry;
            else if (filename.match(/附\s*15.*\.xls$/i)) files.attachment15 = zipEntry;
            else if (filename.match(/附\s*16.*\.xls$/i)) files.attachment16 = zipEntry;
            else if (filename.match(/附\s*17.*\.xls$/i)) files.attachment17 = zipEntry;
            else if (filename.match(/附\s*18.*\.xls$/i)) files.attachment18 = zipEntry;
            else if (filename.match(/附\s*19.*\.xls$/i)) files.attachment19 = zipEntry;
            else if (filename.match(/附\s*25.*\.xlsx?$/i)) files.attachment25 = zipEntry;
            else if (filename.match(/附\s*26.*\.xls$/i)) files.attachment26 = zipEntry;
        }
    }
    
    // 检查必需的文件
    const required = ['attachment9', 'attachment10', 'attachment11'];
    const missing = required.filter(key => !files[key]);
    
    if (missing.length > 0) {
        throw new Error(`缺少必需的附表文件: ${missing.join(', ')}`);
    }
    
    return files;
}

// 加载所有附表数据
async function loadAllAttachments(files) {
    const data = {};
    
    for (const [key, zipEntry] of Object.entries(files)) {
        addLog(`正在加载 ${key}...`, 'info');
        const arrayBuffer = await zipEntry.async('arraybuffer');
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data[key] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        addLog(`${key} 加载完成 (${data[key].length} 行)`, 'success');
    }
    
    return data;
}

// 生成表5工资表（完整业务逻辑）
async function generateTable5(data) {
    addLog('开始生成工资表...', 'info');
    
    let mainData = data.attachment9 || [];
    const installSettle = data.attachment14 || [];
    const repairSettle = data.attachment15 || [];
    const starData = data.attachment19 || [];
    
    // 步骤1: 合并结算数据
    addLog('步骤1: 合并结算数据...', 'info');
    mainData = mergeSettlementData(mainData, installSettle, repairSettle);
    
    // 步骤2: 合并星级数据
    addLog('步骤2: 合并星级数据...', 'info');
    mainData = mergeStarData(mainData, starData);
    
    // 步骤3: 计算折扣率
    addLog('步骤3: 计算折扣率...', 'info');
    mainData = calculateDiscountRate(mainData);
    
    // 步骤4: 识别服务类型
    addLog('步骤4: 识别服务类型...', 'info');
    mainData = identifyServiceType(mainData);
    
    // 步骤5: 按师傅计算提成
    addLog('步骤5: 按师傅计算提成...', 'info');
    const result = calculateCommissionByMaster(mainData);
    
    // 步骤6: 添加工资字段
    addLog('步骤6: 添加工资字段...', 'info');
    const finalResult = addSalaryFields(result);
    
    addLog(`工资表生成完成，共 ${finalResult.length} 位师傅`, 'success');
    return finalResult;
}

// 合并结算数据
function mergeSettlementData(mainData, installSettle, repairSettle) {
    // 创建结算数据映射
    const installMap = {};
    installSettle.forEach(row => {
        const orderNo = row['安装工单号'];
        if (orderNo) {
            installMap[orderNo] = {
                status: row['结算类型'] || '',
                amount: parseFloat(row['结算金额']) || 0
            };
        }
    });
    
    const repairMap = {};
    repairSettle.forEach(row => {
        const orderNo = row['维修工单号'];
        if (orderNo) {
            repairMap[orderNo] = {
                status: row['结算类型'] || '',
                amount: parseFloat(row['结算金额']) || 0
            };
        }
    });
    
    // 合并到主数据
    return mainData.map(row => {
        const orderNo = row['安装维修单号'];
        const installInfo = installMap[orderNo];
        const repairInfo = repairMap[orderNo];
        
        return {
            ...row,
            '安装结算状态': installInfo ? installInfo.status : '',
            '安装结算金额': installInfo ? installInfo.amount : 0,
            '维修结算状态': repairInfo ? repairInfo.status : '',
            '维修结算金额': repairInfo ? repairInfo.amount : 0,
            '结算状态': installInfo ? installInfo.status : (repairInfo ? repairInfo.status : ''),
            '结算金额_CRM': installInfo ? installInfo.amount : (repairInfo ? repairInfo.amount : 0)
        };
    });
}

// 合并星级数据
function mergeStarData(mainData, starData) {
    // 创建星级映射
    const starMap = {};
    starData.forEach(row => {
        const name = row['姓名'];
        if (name) {
            starMap[name] = {
                level: row['星级级别'] || '',
                score: parseFloat(row['综合积分']) || 0
            };
        }
    });
    
    // 合并到主数据
    return mainData.map(row => {
        const master = row['安装/维修师傅'];
        const starInfo = starMap[master];
        
        return {
            ...row,
            '星级': starInfo ? starInfo.level : '',
            '星级分数': starInfo ? starInfo.score : 0
        };
    });
}

// 计算折扣率
function calculateDiscountRate(mainData) {
    return mainData.map(row => {
        const receivable = parseFloat(row['应收金额']) || 0;
        const received = parseFloat(row['实收金额']) || 0;
        const settlementAmount = parseFloat(row['结算金额_CRM']) || 0;
        const serviceFee = parseFloat(row['上门服务费'] || row['服务费']) || 0;
        const valueServiceFee = parseFloat(row['增值服务费用'] || row['增值服务费']) || 0;
        
        // 分子: 实收金额 + 结算金额
        const numerator = received + settlementAmount;
        
        // 分母: 应收金额 - 服务费 - 增值服务费
        const denominator = receivable - serviceFee - valueServiceFee;
        
        // 计算折扣率
        const discountRate = denominator !== 0 ? numerator / denominator : 0;
        
        return {
            ...row,
            '折扣率': discountRate
        };
    });
}

// 识别服务类型
function identifyServiceType(mainData) {
    return mainData.map(row => {
        let serviceType = row['实际安装/维修类型'] || row['安装/维修类型'] || '';
        
        // 如果没有服务类型，根据单据类型判断
        if (!serviceType) {
            const orderType = row['单据类型'] || '';
            if (orderType.includes('CRM安装')) {
                serviceType = '安装';
            } else if (orderType.includes('CRM维修')) {
                serviceType = '维修';
            } else {
                serviceType = '未知';
            }
        }
        
        return {
            ...row,
            '服务类型': serviceType
        };
    });
}

// 获取提成标准
function getCommissionRate(starLevel, starScore, serviceType) {
    // 材料费提成比例
    let materialRate = 0.08; // 默认3星标准
    if (starScore >= 90) {
        materialRate = 0.12;
    } else if (String(starLevel).includes('5星')) {
        materialRate = 0.10;
    } else if (String(starLevel).includes('4星')) {
        materialRate = 0.09;
    } else if (String(starLevel).includes('3星')) {
        materialRate = 0.08;
    }
    
    // 单台人工提成标准
    let unitCommission = 0;
    if (serviceType === '电燃安装') {
        if (starScore >= 88) {
            unitCommission = 30;
        } else if (String(starLevel).includes('5星')) {
            unitCommission = 27;
        } else if (String(starLevel).includes('4星')) {
            unitCommission = 22;
        } else {
            unitCommission = 18;
        }
    } else if (serviceType === '净水安装') {
        if (starScore >= 88) {
            unitCommission = 60;
        } else if (String(starLevel).includes('5星')) {
            unitCommission = 50;
        } else if (String(starLevel).includes('4星')) {
            unitCommission = 40;
        } else {
            unitCommission = 30;
        }
    } else if (serviceType === '小厨宝/前置安装') {
        unitCommission = 20;
    }
    
    return { materialRate, unitCommission };
}

// 按师傅计算提成
function calculateCommissionByMaster(mainData) {
    // 获取所有师傅
    const masters = [...new Set(mainData.map(row => row['安装/维修师傅']).filter(m => m))];
    
    const results = [];
    
    masters.forEach((master, index) => {
        // 获取该师傅的所有工单
        const masterOrders = mainData.filter(row => row['安装/维修师傅'] === master);
        
        if (masterOrders.length === 0) return;
        
        // 获取师傅信息
        const region = masterOrders[0]['区域'] || '';
        const star = masterOrders[0]['星级'] || '';
        const starScore = masterOrders[0]['星级分数'] || 0;
        
        // 获取提成比例
        const { materialRate } = getCommissionRate(star, starScore, '');
        
        // === 1. 计算安装类提成 ===
        const installOrders = masterOrders.filter(row => row['单据类型'] === 'CRM安装工单');
        
        // 1.1 电燃安装
        const electricGas = installOrders.filter(row => ['电', '燃'].includes(row['产品类型']));
        const electricGasCount = electricGas.length;
        const { unitCommission: electricGasUnit } = getCommissionRate(star, starScore, '电燃安装');
        const electricGasCommission = electricGasCount * electricGasUnit;
        
        // 1.2 净水安装
        const water = installOrders.filter(row => row['产品类型'] === '净水');
        const waterCount = water.length;
        const { unitCommission: waterUnit } = getCommissionRate(star, starScore, '净水安装');
        const waterCommission = waterCount * waterUnit;
        
        // 1.3 小厨宝/前置安装
        const smallAppliance = installOrders.filter(row => ['小厨宝', '前置'].includes(row['产品类型']));
        const smallCount = smallAppliance.length;
        const { unitCommission: smallUnit } = getCommissionRate(star, starScore, '小厨宝/前置安装');
        const smallCommission = smallCount * smallUnit;
        
        // 安装台数总提成
        const installUnitCommission = electricGasCommission + waterCommission + smallCommission;
        
        // 1.4 安装材料费提成
        let installMaterialCommission = 0;
        installOrders.forEach(order => {
            const materialFee = parseFloat(order['其他费用']) || 0;
            if (materialFee <= 0) return;
            
            const discountRate = order['折扣率'] || 0;
            
            let discountedFee = 0;
            if (discountRate === 1.0) {
                discountedFee = materialFee;
            } else if (discountRate >= 0.8) {
                discountedFee = materialFee * discountRate;
            }
            
            installMaterialCommission += discountedFee * materialRate;
        });
        
        // === 2. 计算维修类提成 ===
        const repairOrders = masterOrders.filter(row => row['单据类型'] === 'CRM维修工单');
        
        // 2.1 净水保养提成
        const waterMaintenance = repairOrders.filter(row => 
            row['产品类型'] === '净水' && 
            (row['服务类型'] === '保养' || row['服务类型'] === '净水保养')
        );
        let waterMaintenanceCommission = 0;
        waterMaintenance.forEach(order => {
            const materialFee = parseFloat(order['其他费用']) || 0;
            const discountRate = order['折扣率'] || 0;
            
            if (discountRate >= 0.8) {
                const discountedFee = discountRate < 1.0 ? materialFee * discountRate : materialFee;
                waterMaintenanceCommission += discountedFee * materialRate;
            }
        });
        
        // 2.2 配件/电燃保养/其它材料提成
        const otherRepair = repairOrders.filter(row => 
            !(row['服务类型'] === '保养' || row['服务类型'] === '净水保养') ||
            row['产品类型'] !== '净水'
        );
        let otherRepairCommission = 0;
        otherRepair.forEach(order => {
            const materialFee = parseFloat(order['其他费用']) || 0;
            const discountRate = order['折扣率'] || 0;
            
            if (discountRate >= 0.8) {
                const discountedFee = discountRate < 1.0 ? materialFee * discountRate : materialFee;
                otherRepairCommission += discountedFee * materialRate;
            }
        });
        
        // 2.3 维修人工提成
        const normalRepair = repairOrders.filter(row => row['服务类型'] === '维修');
        let repairUnitCommission = normalRepair.length * 20; // 20元/单
        
        const majorRepair = repairOrders.filter(row => String(row['服务类型']).includes('大修'));
        repairUnitCommission += majorRepair.length * 40; // 40元/单
        
        // === 3. 汇总结果 ===
        results.push({
            '序号': index + 1,
            '部门': region,
            '姓名': master,
            '星级': star,
            '星级分数': starScore,
            '工单总数': masterOrders.length,
            '电燃安装台数': electricGasCount,
            '安装单台提成': electricGasUnit,
            '净水安装台数': waterCount,
            '净水安装单台提成': waterUnit,
            '安装台数总提成（电燃/净水）': installUnitCommission + repairUnitCommission,
            '安装材料总提成': installMaterialCommission,
            '净水保养总提成': waterMaintenanceCommission,
            '配件/电燃保养/其它材料总提成': otherRepairCommission
        });
    });
    
    return results;
}

// 添加工资字段
function addSalaryFields(results) {
    return results.map(row => {
        // 加班费和工龄工资
        const overtimePay = 0;
        const seniorityPay = 0;
        
        // 应发工资（隐）
        const grossSalaryHidden = 
            (row['安装台数总提成（电燃/净水）'] || 0) +
            (row['安装材料总提成'] || 0) +
            (row['净水保养总提成'] || 0) +
            (row['配件/电燃保养/其它材料总提成'] || 0) +
            overtimePay +
            seniorityPay;
        
        // 补贴和扣减
        const highTempAllowance = 200; // 9月份高温补贴
        const otherAllowance = 0;
        const satisfactionBonus = 0;
        const penaltyDeduction = 0;
        const otherAdjustment = 0;
        const materialAdvance = 0;
        
        // 应发工资
        const grossSalary = 
            grossSalaryHidden +
            highTempAllowance +
            otherAllowance +
            satisfactionBonus -
            penaltyDeduction -
            otherAdjustment -
            materialAdvance;
        
        // 社保和个税
        const socialInsurance = 0;
        const taxDeduction = 0;
        const tax = 0;
        
        // 实发工资
        const netSalary = grossSalary - socialInsurance - tax + taxDeduction;
        
        return {
            ...row,
            '加班费': overtimePay,
            '工龄工资': seniorityPay,
            '应发工资（隐）': grossSalaryHidden,
            '高温补贴': highTempAllowance,
            '其他补贴': otherAllowance,
            '满意度等奖励': satisfactionBonus,
            '催办/投诉等负激励': penaltyDeduction,
            '其它正负激励/减项': otherAdjustment,
            '铺底材料款': materialAdvance,
            '应发工资': grossSalary,
            '社保代扣费用': socialInsurance,
            '个税专项附加扣除': taxDeduction,
            '个税': tax,
            '实发金额': netSalary
        };
    });
}

// 显示结果
function showResult(data) {
    progressSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    // 更新统计信息
    const endTime = Date.now();
    const processTime = ((endTime - startTime) / 1000).toFixed(2);
    
    document.getElementById('totalRecords').textContent = data.length;
    
    // 计算唯一人数
    const uniquePersons = new Set(data.map(row => row['姓名'])).size;
    document.getElementById('totalPersons').textContent = uniquePersons;
    
    document.getElementById('processTime').textContent = `${processTime}s`;
    
    // 生成表格预览
    generateTablePreview(data.slice(0, 100));
}

// 生成表格预览
function generateTablePreview(data) {
    if (data.length === 0) {
        document.getElementById('tableWrapper').innerHTML = '<p>没有数据</p>';
        return;
    }
    
    const columns = Object.keys(data[0]);
    
    let html = '<table><thead><tr>';
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    data.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            const value = row[col];
            const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
            html += `<td>${displayValue}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    document.getElementById('tableWrapper').innerHTML = html;
}

// 下载结果
function downloadResult() {
    if (!processedData || processedData.length === 0) {
        showError('没有可下载的数据');
        return;
    }
    
    try {
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(processedData);
        
        // 设置列宽
        const cols = Object.keys(processedData[0]).map(() => ({ wch: 15 }));
        ws['!cols'] = cols;
        
        XLSX.utils.book_append_sheet(wb, ws, '工资表');
        
        // 生成文件名
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `表5_自动生成_${timestamp}.xlsx`;
        
        // 下载
        XLSX.writeFile(wb, filename);
        
        addLog(`文件已下载: ${filename}`, 'success');
    } catch (error) {
        console.error('下载错误:', error);
        showError(`下载失败: ${error.message}`);
    }
}

// 显示错误
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    progressSection.style.display = 'none';
    resultSection.style.display = 'none';
}

// 重置
function reset() {
    uploadedFile = null;
    processedData = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    processBtn.style.display = 'none';
    processBtn.disabled = false;
    progressSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
    logContainer.innerHTML = '';
    updateProgress(0, '');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
