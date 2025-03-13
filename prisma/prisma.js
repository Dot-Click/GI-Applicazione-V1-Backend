import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

// export const validator = prisma.$extends({
//   query: {
//     order: {
//       create({ args, query }) {
//         try {
//           args.data = createOrder.parse(args.data);
//           return query(args);
//         } catch (error) {
//           if (error instanceof ZodError) {
//             throw new Error(
//               JSON.stringify(
//                 error.errors.map((err) => ({
//                   field: err.path.join("."),
//                   message: err.message,
//                 }))
//               )
//             );
//           }
//           throw error;
//         }
//       },
//       update({args,query}){
//         try {
//           args.data = createOrder.partial().parse(args.data);
//           return query(args);
//         } catch (error) {
//           if (error instanceof ZodError) {
//             throw new Error(
//               JSON.stringify(
//                 error.errors.map((err) => ({
//                   field: err.path.join("."),
//                   message: err.message,
//                 }))
//               )
//             );
//           }
//           throw error;
//         }
//       }
//     },
//     customer:{
//       create({ args, query }) {
//         try {
//           args.data = createCustomer.parse(args.data);
//           return query(args);
//         } catch (error) {
//           if (error instanceof ZodError) {
//             throw new Error(
//               JSON.stringify(
//                 error.errors.map((err) => ({
//                   field: err.path.join("."),
//                   message: err.message,
//                 }))
//               )
//             );
//           }
//           throw error;
//         }
//       },
//       update({args,query}) {
//         try {
//           args.data = createCustomer.partial().parse(args.data);
//           return query(args);
//         } catch (error) {
//           if (error instanceof ZodError) {
//             throw new Error(
//               JSON.stringify(
//                 error.errors.map((err) => ({
//                   field: err.path.join("."),
//                   message: err.message,
//                 }))
//               )
//             );
//           }
//           throw error;
//         }
//       }
//     },
//     supplier:{
//       create({ args, query }) {
//         try {
//           args.data = createSupplier.parse(args.data);
//           return query(args);
//         } catch (error) {
//           if (error instanceof ZodError) {
//             throw new Error(
//               JSON.stringify(
//                 error.errors.map((err) => ({
//                   field: err.path.join("."),
//                   message: err.message,
//                 }))
//               )
//             );
//           }
//           throw error;
//         }
//       },
//       update({args,query}) {
//         try {
//           args.data = createSupplier.partial().parse(args.data);
//           return query(args);
//         } catch (error) {
//           if (error instanceof ZodError) {
//             throw new Error(
//               JSON.stringify(
//                 error.errors.map((err) => ({
//                   field: err.path.join("."),
//                   message: err.message,
//                 }))
//               )
//             );
//           }
//           throw error;
//         }
//       }
//     },
//   },
// });

export default prisma;
