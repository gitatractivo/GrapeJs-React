import React, { useEffect, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {
  BlocksProvider,
  useEditor,
} from "@grapesjs/react";
import CustomBlockManager from "./CustomBlockManager.tsx";
import { BASE_URL } from '../utils/base.ts';
import axios from 'axios';
import PdfAccordion from './PdfAccordian.tsx';

const saveEditorJsonApiUrl = BASE_URL + "/api/auth/save-json";

const isImage = (src) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const ext = src.split('.').pop().toLowerCase();
  return imageExtensions.includes(ext);
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const SidebarTabComponent = () => {
  const editor = useEditor();
  const [value, setValue] = useState(0);
  const [assets, setAssets] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const saveData = async () => {
    const userId = JSON.parse(localStorage.getItem("userDetails"))._id;

    try {
      const response = await axios.post(saveEditorJsonApiUrl, {
        userId,
        JSONString: JSON.stringify(editor.getProjectData()),
      });
      return response.data;
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    setAssets(editor.Assets.getAll());
    editor.on('asset', (args) => {
      if (args.event === "update") {
        setAssets(args.model.models);

        const updatedAsset = args.model.models.find(asset => {
          return !assets.some(existingAsset => existingAsset.cid === asset.cid);
        });

        if (updatedAsset) {
          if(isImage(updatedAsset.get("src"))){
            return;
          }
          setValue(1);
          setExpandedAccordion(updatedAsset.cid);
          saveData();
        }

      }
      if (args.event === "reset") {
        setAssets(args.model.models);
      }
    });
  }, [editor, assets]);

  const pdfAssets = useMemo(() => {
    return assets.filter(a => !isImage(a.get('src')));
  }, [assets]);


  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <div className='w-full '>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab
            label="Add Sections"
            {...a11yProps(0)}
            sx={{
              background: value === 0 ? 'linear-gradient(to right, #1D85E6, #81C0F7)' : '#6C6C6C',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          />
          <Tab
            label="Components"
            {...a11yProps(1)}
            sx={{
              background: value === 1 ? 'linear-gradient(to right, #1D85E6, #81C0F7)' : '#6C6C6C',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          />
        </Tabs>
      </Box>

      {value === 0 ? (
        <BlocksProvider>
          {(props) => <CustomBlockManager {...props} />}
        </BlocksProvider>
      ) : (
        <div className='flex flex-col gap-3 py-4'>
          {pdfAssets.map(item => (
            <PdfAccordion
              key={item.cid}
              item={item}
              expanded={expandedAccordion === item.cid}
              onChange={handleAccordionChange(item.cid)}
            />  
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarTabComponent;
