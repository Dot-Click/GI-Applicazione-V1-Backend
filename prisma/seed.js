// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      orderSeq: {
        create: {
          added_col_array: ['code', 'description', 'workAmount'],
          visible_col_array: ['code', 'description', 'workAmount', 'state'],
          archive_added_col_array: ['code', 'description'],
          archive_visible_col_array: ['code', 'description', 'state']
        }
      },
      supplierSeq: {
        create: {
          added_col_array: ['code', 'companyName', 'vat'],
          visible_col_array: ['code', 'companyName', 'vat', 'status']
        }
      },
      customerSeq: {
        create: {
          added_col_array: ['code', 'companyName', 'vat'],
          visible_col_array: ['code', 'companyName', 'vat', 'status']
        }
      },
      employeeSeq: {
        create: {
          added_col_array: ['code', 'name', 'surname'],
          visible_col_array: ['code', 'name', 'surname', 'status'],
          archive_added_col_array: ['code', 'name'],
          archive_visible_col_array: ['code', 'name', 'status']
        }
      }
    }
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      code: 'CLI-665132',
      email: 'customer1@example.com',
      name: 'John Customer',
      password: await bcrypt.hash('customer123', 10),
      companyName: 'Customer One Inc.',
      vat: 'IT12345678901',
      taxId: '12345678901',
      nation: 'Italy',
      province: 'MI',
      address: 'Via Roma 1',
      common: 'Milan',
      cap: '20100',
      telephone: '+3 (901) 2345 6789',
      status: 'active',
      adminId: admin.id
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      code: 'CLI-665133',
      email: 'customer2@example.com',
      name: 'Jane Client',
      password: await bcrypt.hash('customer123', 10),
      companyName: 'Client Two SRL',
      vat: 'IT98765432109',
      taxId: '98765432109',
      nation: 'Italy',
      province: 'RM',
      address: 'Via Milano 2',
      common: 'Rome',
      cap: '00100',
      telephone: '+390987654321',
      status: 'active',
      adminId: admin.id
    }
  });

  // Create Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      code: 'FOR-123456',
      email: 'supplier1@example.com',
      name: 'Mario Supplier',
      password: await bcrypt.hash('supplier123', 10),
      companyName: 'Supplier One SPA',
      vat: 'IT11223344556',
      taxId: '11223344556',
      nation: 'Italy',
      province: 'TO',
      address: 'Corso Francia 10',
      common: 'Turin',
      cap: '10100',
      telephone: '+3 (901) 1122 2333',
      status: 'active',
      adminId: admin.id
    }
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      code: 'FOR-123457',
      email: 'supplier2@example.com',
      name: 'Luigi Vendor',
      password: await bcrypt.hash('supplier123', 10),
      companyName: 'Vendor Two SRL',
      vat: 'IT66554433221',
      taxId: '66554433221',
      nation: 'Italy',
      province: 'BO',
      address: 'Via Emilia 15',
      common: 'Bologna',
      cap: '40100',
      telephone: '+3 (904) 4455 5666',
      status: 'active',
      adminId: admin.id
    }
  });

  // Create Employees
  const employee1 = await prisma.employee.create({
    data: {
      code: 'DIP-624281',
      email: 'employee1@example.com',
      name: 'Marco',
      surname: 'Rossi',
      taxId: 'RSSMRC80A01H501R',
      sector: 'Construction',
      startDate: new Date('2020-01-15'),
      endDate: new Date('2025-12-31'),
      municipalityOfBirth: 'Milan',
      level: 'Senior',
      qualification: 'Engineer',
      nameAndsurname: 'Marco Rossi',
      status: 'active',
      address: 'Via Torino 5, Milan',
      telephone: '+3 (933) 3111 2222',
      role: 'Technical_Manager',
      adminId: admin.id,
      unilavs: {
        create: {
          name: 'Unilav Training 2023',
          status: 'active',
          state: 'Valido',
          attachment: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
          healthEligibility: 'Yes',
          expiryDate: '2024-12-31',
          dataRilascio: '2023-01-15',
          validityDays: '730'
        }
      },
      seritias: {
        create: {
          name: 'Safety Course',
          status: 'active',
          state: 'Valido',
          attachment: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
          healthEligibility: 'Yes',
          expiryDate: '2024-06-30',
          dataRilascio: '2022-06-30',
          validityDays: '365'
        }
      },
      formazones: {
        create: {
          name: 'Advanced Construction',
          status: 'active',
          state: 'Valido',
          attachment: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
          training: 'Advanced techniques',
          expiryDate: '2024-12-31',
          dataRilascio: '2022-12-31',
          validityDays: '730'
        }
      }
    }
  });

  const employee2 = await prisma.employee.create({
    data: {
      code: 'DIP-624282',
      email: 'employee2@example.com',
      name: 'Laura',
      surname: 'Bianchi',
      taxId: 'BNCLRA85B42H501W',
      sector: 'Management',
      startDate: new Date('2019-05-10'),
      endDate: new Date('2026-12-31'),
      municipalityOfBirth: 'Rome',
      level: 'Manager',
      qualification: 'Project Manager',
      nameAndsurname: 'Laura Bianchi',
      status: 'active',
      address: 'Via Appia 10, Rome',
      telephone: '+3 (933) 3444 5555',
      role: 'Order_Manager',
      adminId: admin.id
    }
  });

  // Create Orders
  const order1 = await prisma.order.create({
    data: {
      code: 'COM-227899',
      description: 'Office Building Construction',
      workAmount: 500000.00,
      advancePayment: 100000.00,
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-12-31'),
      address: 'Via Milano 15, Milan',
      state: 'IN_PROGRESS',
      orderManager: 'Laura Bianchi',
      siteManager: 'Marco Rossi',
      technicalManager: 'Marco Rossi',
      adminId: admin.id,
      supplierId: supplier1.id,
      employeeId: employee1.id,
      customerId: customer1.id,
      cig: '1234567890',
      cup: 'ABCDEFGHIJ',
      iva: 22.00,
      dipositRecovery: 50000.00,
      jobName: 'Office Complex',
      projectName: 'Sky Tower',
      typology: 'Commercial',
      contract: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_contract: 'lorem ipsum',
      permission_to_build: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_permission_to_build: 'lorem ipsum',
      psc: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_psc: 'lorem ipsum',
      pos: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_pos: 'lorem ipsum',
      withholdingAmount: 5000.00
    }
  });

  const order2 = await prisma.order.create({
    data: {
      code: 'COM-227900',
      description: 'Residential Building Renovation',
      workAmount: 250000.00,
      advancePayment: 50000.00,
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-06-30'),
      address: 'Via Roma 25, Rome',
      state: 'ON_HOLD',
      orderManager: 'Laura Bianchi',
      siteManager: 'Marco Rossi',
      technicalManager: 'Marco Rossi',
      adminId: admin.id,
      supplierId: supplier2.id,
      employeeId: employee2.id,
      customerId: customer2.id,
      cig: '0987654321',
      cup: 'KLMNOPQRST',
      iva: 22.00,
      dipositRecovery: 25000.00,
      jobName: 'Villa Renovation',
      projectName: 'Green Villa',
      typology: 'Residential',
      contract: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_contract: 'Renovation contract',
      permission_to_build: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_permission_to_build: 'lorem ipsum',
      psc: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_psc: 'lorem ipsum',
      pos: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      desc_pos: 'lorem ipsum',
      withholdingAmount: 2500.00
    }
  });

  // Create Accounts
  const account1 = await prisma.accounts.create({
    data: {
      code: 'DOC_76543',
      suppCode: supplier1.code,
      wbs: 'WBS001',
      date: new Date('2023-06-15'),
      adminId: admin.id,
      ordCode: order1.code,
      status: 'Da_approvare',
      current_SAL_amount: 150000.00,
      progressive_SAL_amount: 150000.00,
      see_SAL: 'Yes',
      see_CDP: 'No',
      sal: {
        create: {
          total: 150000.00,
          discounts: 5000.00,
          roundingDiscount: 100.00,
          agreed: 144900.00,
          sect: {
            create: [
              {
                title: 'Foundation Work',
                salData: {
                  create: [
                    {
                      unitOfMeasures: 'sqm',
                      eqlParts: 100,
                      description: 'Concrete foundation',
                      lun: 50,
                      lar: 30,
                      alt: 1,
                      quantity: 1500,
                      price: 50.00,
                      amount: 75000.00
                    },
                    {
                      unitOfMeasures: 'cubic meters',
                      eqlParts: 50,
                      description: 'Excavation',
                      lun: 50,
                      lar: 30,
                      alt: 2,
                      quantity: 3000,
                      price: 25.00,
                      amount: 75000.00
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  });

  const account2 = await prisma.accounts.create({
    data: {
      code: 'DOC_76544',
      suppCode: supplier2.code,
      wbs: 'WBS002',
      date: new Date('2023-09-15'),
      adminId: admin.id,
      ordCode: order2.code,
      status: 'Da_approvare',
      current_SAL_amount: 75000.00,
      progressive_SAL_amount: 75000.00,
      see_SAL: 'https://res.cloudinary.com/djv0vl33b/image/upload/v1746276870/sample_navqdr.pdf',
      sal: {
        create: {
          total: 75000.00,
          discounts: 2500.00,
          roundingDiscount: 50.00,
          agreed: 72450.00,
          sect: {
            create: [
              {
                title: 'Demolition Work',
                salData: {
                  create: [
                    {
                      unitOfMeasures: 'sqm',
                      eqlParts: 80,
                      description: 'Wall demolition',
                      lun: 20,
                      lar: 15,
                      alt: 3,
                      quantity: 900,
                      price: 50.00,
                      amount: 45000.00
                    },
                    {
                      unitOfMeasures: 'unit',
                      eqlParts: 20,
                      description: 'Debris removal',
                      quantity: 1,
                      price: 30000.00,
                      amount: 30000.00
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  });

  const account3 = await prisma.accounts.create({
  data: {
    code: 'DOC_76666',
    custCode: customer1.code,
    wbs: 'WBS010',
    date: new Date('2023-07-20'),
    adminId: admin.id,
    ordCode: order1.code,
    status: 'Da_approvare',
    current_SAL_amount: 0,
    progressive_SAL_amount: 0,
    see_CDP: 'Yes',
    cdp: {
      create: {
        currentWorkAmountSubjectToReduction: 100000,
        currentWorkAmountNotSubjectToDiscount: 20000,
        iva: 22, // assuming 22% VAT
        reducedAmount: 100000,
        currentWorksAmount: 200000,
        advPayment: 30000,
        withholdingTax: 10000,
        amtPresentCDP: 130000,
        vat: (130000 * 22) / 100, // 28600
        totalAmount: 130000 + ((130000 * 22) / 100), // 158600
        add_additional_1: null,
        add_additional_2: null,
        add_additional_3: null
      }
    }
  }
  });

  const account4 = await prisma.accounts.create({
  data: {
    code: 'DOC_73265',
    custCode: customer2.code,
    wbs: 'WBS011',
    date: new Date('2023-08-10'),
    adminId: admin.id,
    ordCode: order2.code,
    status: 'Approvato',
    current_SAL_amount: 0,
    progressive_SAL_amount: 0,
    see_CDP: 'Yes',
    cdp: {
      create: {
        currentWorkAmountSubjectToReduction: 50000,
        currentWorkAmountNotSubjectToDiscount: 15000,
        iva: 22,
        reducedAmount: 50000,
        currentWorksAmount: 100000,
        advPayment: 20000,
        withholdingTax: 5000,
        amtPresentCDP: 75000, // 100k - 20k - 5k
        vat: (75000 * 22) / 100, // 16500
        totalAmount: 75000 + ((75000 * 22) / 100), // 91500
        add_additional_1: null,
        add_additional_2: null,
        add_additional_3: null
      }
    }
  }
  });


  // Create Invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      docNo: 'INV2023001',
      vat: 'IT12345678901',
      name: 'Customer One Inc.',
      taxAmt: 11000.00,
      docDate: new Date('2023-07-01'),
      vatRate: 22.00,
      typology: 'Construction Services',
      processed: 'No',
      type: 'attive',
      yearOfCompetence: '2023',
      protocol: 'PRT2023001',
      attachment: 'invoice_001.pdf',
      adminId: admin.id,
      customerId: customer1.id,
      ricavi: {
        create: {
          docNo: 'DOC_76583',
          workSite: 'Office Building',
          iva: '22%',
          wbs: 'WBS001',
          note: 'First installment',
          docDate: new Date('2023-07-01'),
          yearOfCompetence: '2023',
          revAmt: 50000.00,
          advancePayment: 10000.00,
          withHoldAmt: 5000.00
        }
      }
    }
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      docNo: 'INV2023002',
      vat: 'IT98765432109',
      name: 'Client Two SRL',
      taxAmt: 5500.00,
      docDate: new Date('2023-10-01'),
      vatRate: 22.00,
      typology: 'Renovation Services',
      processed: 'No',
      type: 'attive',
      yearOfCompetence: '2023',
      protocol: 'PRT2023002',
      attachment: 'invoice_002.pdf',
      adminId: admin.id,
      customerId: customer2.id,
      ricavi: {
        create: {
          docNo: 'DOC_73265',
          workSite: 'Residential Building',
          iva: '22%',
          wbs: 'WBS002',
          note: 'First installment',
          docDate: new Date('2023-10-01'),
          yearOfCompetence: '2023',
          revAmt: 25000.00,
          advancePayment: 5000.00,
          withHoldAmt: 2500.00
        }
      }
    }
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      docNo: 'INV2023003',
      vat: 'IT11223344556',
      name: 'Supplier One SPA',
      taxAmt: 4400.00,
      docDate: new Date('2023-07-15'),
      vatRate: 22.00,
      typology: 'Construction Materials',
      processed: 'No',
      type: 'passive',
      yearOfCompetence: '2023',
      protocol: 'PRT2023003',
      attachment: 'invoice_003.pdf',
      adminId: admin.id,
      supplierId: supplier1.id,
      costi: {
        create: {
          docNo: 'DOC_76543',
          workSite: 'Office Building',
          iva: '22%',
          wbs: 'WBS001',
          note: 'Concrete delivery',
          docDate: new Date('2023-07-15'),
          yearOfCompetence: '2023',
          revAmt: 20000.00,
          advancePayment: 5000.00,
          withHoldAmt: 2000.00
        }
      }
    }
  });

  const invoice4 = await prisma.invoice.create({
    data: {
      docNo: 'INV2023004',
      vat: 'IT66554433221',
      name: 'Vendor Two SRL',
      taxAmt: 2200.00,
      docDate: new Date('2023-10-15'),
      vatRate: 22.00,
      typology: 'Demolition Services',
      processed: 'No',
      type: 'passive',
      yearOfCompetence: '2023',
      protocol: 'PRT2023004',
      attachment: 'invoice_004.pdf',
      adminId: admin.id,
      supplierId: supplier2.id,
      costi: {
        create: {
          docNo: 'DOC_73265',
          workSite: 'Residential Building',
          iva: '22%',
          wbs: 'WBS002',
          note: 'Demolition work',
          docDate: new Date('2023-10-15'),
          yearOfCompetence: '2023',
          revAmt: 10000.00,
          advancePayment: 2500.00,
          withHoldAmt: 1000.00
        }
      }
    }
  });


  console.log('Seed data created successfully!');
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });