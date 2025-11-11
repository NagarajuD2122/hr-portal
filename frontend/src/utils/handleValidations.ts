import { useImperativeHandle, useState, useEffect, useCallback } from "react";
import { cloneDeep, isEqual, map, omit, pick } from "lodash";
import {  useParams } from "react-router-dom";


interface UseHandleTabValues {
  ref?: any;
  refsArray?: any[];
  loadingFun?: any;
  formKey: any;
}

const useHandleFormValues = ({ ref, refsArray, loadingFun, formKey }: UseHandleTabValues) => {
  const [copyInitValues, setCopyInitValues] = useState<{} | null>(null);
  const params: any = useParams();
  const getApprovalFormValues = () => {
    const filterData: any[] = [];
    refsArray?.map((item) => {
      item.current?.map((value: any) => {
        return filterData.push(value?.values);
      });
    });
    const returnData = {
      useGroupId: "",
      rules: filterData,
    };
    return returnData;
  };
  const mapInitValues = () => {
    const data = refsArray?.reduce((acc, currRef) => {
      if (Array.isArray(currRef?.current)) {
        return getApprovalFormValues();
      } else {
        const values = currRef?.current?.values || {};
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined || !(key in acc)) {
            acc[key] = value;
          }
        });
      }
      return acc;
    }, {});

    if (copyInitValues === null) {
      setCopyInitValues(data);
    }

    return data;
  };

  useEffect(() => {
    if (copyInitValues === null && refsArray) {
      mapInitValues();
    }
  }, [refsArray]); // Empty dependency array ensures this runs only once after the initial render

  useImperativeHandle(ref, () => ({
    onCheckFormValues: async () => {
      const currentValues = await mapInitValues();
      const obj = {
        data: currentValues,
        status: isEqual(copyInitValues, currentValues),
        key: "", /// tab key
      };
      return obj;
    },
    onCreate: async () => {
      switch (formKey) {

        default:
          break;
      }
    },
  }));

  const checkedIsValid = useCallback(() => {

    const allValid = refsArray?.every((ref) => {
      if (!ref?.current) return false;
      if (Array.isArray(ref.current)) {
        return ref.current.every(
          (form: any) => form && Object.keys(form.errors || {}).length === 0
        );
      }
      return ref.current && Object.keys(ref.current.errors || {}).length === 0;
    });

    const saveButtonElm = document.getElementById("save_btn");
    const saveButtonElm1 = document.getElementById("save_btn1");
    if (allValid && copyInitValues !== null) {
      const returnData = isEqual(copyInitValues, mapInitValues());
      if (saveButtonElm) {
        saveButtonElm.classList.toggle("p-disabled", returnData);
      }
      if (saveButtonElm1) {
        saveButtonElm1.classList.toggle("p-disabled", returnData);
      }
    }
  }, [refsArray, copyInitValues, mapInitValues]);

  const updateCoyValues = async () => {
    const currentValues = await mapInitValues();
    setCopyInitValues(currentValues);
  };

  return {
    checkedIsValid,
    updateCoyValues,
  };
};

export default useHandleFormValues;
