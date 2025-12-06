import { chakra, type BoxProps } from "@chakra-ui/react";
import type { FormProps } from "react-router-dom";



export type BoxFormProps = Partial<BoxProps & FormProps>

const BoxForm = chakra("form")
export default BoxForm